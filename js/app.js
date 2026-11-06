// QualiQ アプリ本体
// 画面の HTML から onclick で呼ぶ関数は window に公開している。それ以外はこの関数スコープ内に閉じる。
(function () {
    'use strict';

    const { MASTER_EXAMS_CATALOG, stripTitlePrefix } = window.QualiQData;

    // Firebase は動的 import で読み込む（CDN に届かなくてもアプリ本体は動かすため）
    const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/11.6.1';
    // __app_id / __firebase_config / __initial_auth_token は、外部のホスティング環境から設定を注入するための任意のグローバル変数。
    // 通常の公開（GitHub Pages など）では定義されず、下の既定値が使われる
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'kentei-exam-app';
    // Web 用の Firebase 設定は公開前提の識別子（秘密鍵ではない）。アクセス制御は Firestore ルールで行う
    const firebaseConfig = typeof __firebase_config !== 'undefined'
        ? JSON.parse(__firebase_config)
        : {
            apiKey: "AIzaSyA_B4lEKyuZBuDHxW1_rB45bssqRaKQAWQ",
            authDomain: "quiz-49883.firebaseapp.com",
            projectId: "quiz-49883",
            storageBucket: "quiz-49883.firebasestorage.app",
            messagingSenderId: "443782194145",
            appId: "1:443782194145:web:b7e45a5be38fc89b1d28a0"
        };
    const CLOUD_INIT_TIMEOUT_MS = 10000;
    // 保存キーの接頭辞 quailq: は旧アプリ名の名残。変えると保存済みの学習データ・中断中の演習が読めなくなるため据え置く
    const LOCAL_STORAGE_KEY = `quailq:${appId}:data:v1`;
    const DATA_COLLECTIONS = ['tasks', 'history', 'customExams', 'bookmarks'];

    let fb = null;          // 読み込んだ Firebase の関数群
    let auth = null;
    let db = null;
    let currentUser = null;
    // 'loading' | 'cloud'（Firestore 同期） | 'local'（この端末の localStorage） | 'memory'（保存不可）
    let storageMode = 'loading';
    let snapshotUnsubscribers = [];
    let pendingWrites = [];  // 保存先が決まる前（接続中）の書き込みを保留する
    let historyChartInstance = null;

    // アプリ内グローバル状態
    window.appState = {
        currentExamQuestions: [],
        currentQuestionIndex: 0,
        selectedAnswers: {}, 
        tasks: [],           
        history: [],  
        customExams: [],       
        bookmarks: [],          // { qid, createdAt }
        answerMode: 'batch',    // 'batch'（まとめて採点） | 'instant'（一問ずつ答え合わせ）
        sessionMode: 'batch',   // 実施中の演習のモード
        revealed: {},           // 一問ずつモードで答え合わせ済みの問題 index
        lastWrongQuestions: [], // 直前の演習で間違えた問題
        sessionMeta: { groupName: '', passLine: 70, passNote: '' },
        historyFilter: 'ALL',   // 成績画面の絞り込み（groupName）
        examInProgress: false,  // 演習の途中か
        hasResult: false,       // 結果画面に表示できる結果があるか
        activeCategory: 'ALL',
        searchQuery: '',
        startTime: null,
        timerInterval: null,
        elapsedSeconds: 0
    };

    // --- データ保存レイヤー（Firestore / localStorage 切替） ---
    function sortHistory(list) {
        return [...list].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
    }

    function sortByCreatedAsc(list) {
        return [...list].sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0));
    }

    function loadLocalData() {
        let data = {};
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) data = JSON.parse(raw) || {};
        } catch (e) {
            console.warn('ローカルデータを読み込めませんでした:', e);
        }
        DATA_COLLECTIONS.forEach(name => {
            window.appState[name] = Array.isArray(data[name]) ? data[name] : [];
        });
    }

    function saveLocalData() {
        try {
            const data = {};
            DATA_COLLECTIONS.forEach(name => { data[name] = window.appState[name]; });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('ローカルに保存できませんでした:', e);
            if (storageMode !== 'memory') {
                storageMode = 'memory';
                updateSyncBadge();
            }
            return false;
        }
    }

    function renderAllData() {
        renderTasks();
        renderExamsGrid();
        renderHistory();
        refreshBookmarkButtons();
    }

    const DATA_RENDERERS = {
        tasks: () => renderTasks(),
        history: () => renderHistory(),
        customExams: () => { renderExamsGrid(); renderLearningInsights(); },
        bookmarks: () => { renderLearningInsights(); refreshBookmarkButtons(); }
    };

    function updateSyncBadge() {
        const badge = document.getElementById('sync-badge');
        if (!badge) return;
        const states = {
            loading: ['bg-slate-50 text-slate-600 border-slate-200', 'bg-slate-400 animate-pulse', '接続中…', 'クラウドに接続しています'],
            cloud:   ['bg-emerald-50 text-emerald-700 border-emerald-200', 'bg-emerald-500', 'クラウド同期中', '学習データは Firebase に保存されています'],
            local:   ['bg-amber-50 text-amber-700 border-amber-200', 'bg-amber-500', 'この端末に保存', 'クラウドに接続できないため、このブラウザに保存しています'],
            memory:  ['bg-rose-50 text-rose-700 border-rose-200', 'bg-rose-500', '一時保存のみ', 'ブラウザの保存領域が使えないため、再読み込みするとデータが消えます']
        };
        const [boxCls, dotCls, label, tip] = states[storageMode] || states.loading;
        badge.className = `flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs border ${boxCls}`;
        badge.title = tip;
        badge.innerHTML = `<span class="w-2 h-2 rounded-full ${dotCls}"></span><span class="font-medium">${label}</span>`;
    }

    function switchToLocalMode(reason) {
        if (storageMode === 'local' || storageMode === 'memory') return;
        console.warn('ローカル保存モードに切り替えます:', reason);
        snapshotUnsubscribers.forEach(unsub => { try { unsub(); } catch (_) {} });
        snapshotUnsubscribers = [];
        storageMode = 'local';
        loadLocalData();
        renderAllData();
        updateSyncBadge();
        flushPendingWrites();
    }

    function flushPendingWrites() {
        const queued = pendingWrites;
        pendingWrites = [];
        queued.forEach(fn => fn());
    }

    function isCloudActive() {
        return storageMode === 'cloud' && currentUser && fb;
    }

    function userCollection(name) {
        return fb.collection(db, 'artifacts', appId, 'users', currentUser.uid, name);
    }

    function addRecordLocally(name, data) {
        const record = { id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...data };
        window.appState[name] = [...window.appState[name], record];
        saveLocalData();
        DATA_RENDERERS[name]();
    }

    // Firestore への書き込みは await しない（オフライン時もローカルキャッシュ経由で即座に画面へ反映される）
    function addRecord(name, data) {
        if (storageMode === 'loading') {
            pendingWrites.push(() => addRecord(name, data));
            return;
        }
        if (isCloudActive()) {
            fb.addDoc(userCollection(name), data).catch(err => {
                switchToLocalMode(err);
                addRecordLocally(name, data);
            });
            return;
        }
        addRecordLocally(name, data);
    }

    function updateRecordLocally(name, id, data) {
        window.appState[name] = window.appState[name].map(item => item.id === id ? { ...data, id } : item);
        saveLocalData();
        DATA_RENDERERS[name]();
    }

    function updateRecord(name, id, data) {
        const { id: _ignored, ...fields } = data;
        if (storageMode === 'loading') {
            pendingWrites.push(() => updateRecord(name, id, fields));
            return;
        }
        if (isCloudActive()) {
            fb.setDoc(fb.doc(db, 'artifacts', appId, 'users', currentUser.uid, name, id), fields).catch(err => {
                switchToLocalMode(err);
                updateRecordLocally(name, id, fields);
            });
            return;
        }
        updateRecordLocally(name, id, fields);
    }

    function removeRecords(name, ids) {
        if (ids.length === 0) return;
        if (storageMode === 'loading') {
            pendingWrites.push(() => removeRecords(name, ids));
            return;
        }
        if (isCloudActive()) {
            ids.forEach(id => {
                fb.deleteDoc(fb.doc(db, 'artifacts', appId, 'users', currentUser.uid, name, id))
                    .catch(err => console.error(`${name} の削除に失敗しました:`, err));
            });
            return;
        }
        const idSet = new Set(ids);
        window.appState[name] = window.appState[name].filter(item => !idSet.has(item.id));
        saveLocalData();
        DATA_RENDERERS[name]();
    }

    function withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms))
        ]);
    }

    // Auth ＆ 初期化処理
    async function initAuthAndData() {
        updateSyncBadge();
        try {
            await withTimeout((async () => {
                const [appMod, authMod, fsMod] = await Promise.all([
                    import(`${FIREBASE_SDK}/firebase-app.js`),
                    import(`${FIREBASE_SDK}/firebase-auth.js`),
                    import(`${FIREBASE_SDK}/firebase-firestore.js`)
                ]);
                fb = { ...appMod, ...authMod, ...fsMod };
                const firebaseApp = fb.initializeApp(firebaseConfig);
                auth = fb.getAuth(firebaseApp);
                try {
                    // オフライン中の書き込みもリロード後に残るよう IndexedDB キャッシュを使う
                    db = fb.initializeFirestore(firebaseApp, {
                        localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() })
                    });
                } catch (e) {
                    console.warn('永続キャッシュを使えないため通常モードで接続します:', e);
                    db = fb.getFirestore(firebaseApp);
                }
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await fb.signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await fb.signInAnonymously(auth);
                }
            })(), CLOUD_INIT_TIMEOUT_MS);
        } catch (e) {
            switchToLocalMode(e);
            return;
        }

        fb.onAuthStateChanged(auth, (user) => {
            if (storageMode === 'local' || storageMode === 'memory') return;
            currentUser = user;
            if (user) {
                storageMode = 'cloud';
                updateSyncBadge();
                setupRealtimeListeners();
                flushPendingWrites();
            } else {
                switchToLocalMode('サインインしていません');
            }
        });
    }

    function setupRealtimeListeners() {
        snapshotUnsubscribers.forEach(unsub => unsub());
        const listen = (name, transform) => fb.onSnapshot(
            userCollection(name),
            (snapshot) => {
                // doc.id を最後に置き、データ内の id で上書きされないようにする
                const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
                window.appState[name] = transform ? transform(items) : items;
                DATA_RENDERERS[name]();
            },
            (error) => switchToLocalMode(error)
        );
        snapshotUnsubscribers = [
            listen('tasks', sortByCreatedAsc),
            listen('history', sortHistory),
            listen('customExams', sortByCreatedAsc),
            listen('bookmarks', sortHistory)
        ];
    }

    window.addEventListener('load', () => {
        initAuthAndData();
        renderExamsGrid();
        applyTheme();
        renderAnswerModeToggle();
        renderLearningInsights();
        renderCategoryTabs();

        // 初期表示：演習中にリロードした場合は続きから再開、それ以外は URL の画面（演習・結果はホーム）
        const initialView = viewFromHash();
        if (initialView === 'exam' && loadActiveSession()) {
            resumeSavedSession();
        } else {
            const view = ['history', 'support'].includes(initialView) ? initialView : 'home';
            history.replaceState({ view }, '', `#${view}`);
            showView(view);
        }

        // 読み込みが終わったらすぐに表示する（演出のための待ち時間は入れない）
        const splash = document.getElementById('splash-screen');
        document.getElementById('app-container').classList.remove('hidden');
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; }, 300);
    });

    // ===== 画面遷移（URL ハッシュと連動。ブラウザの戻る・進むに対応） =====
    const VIEWS = ['home', 'exam', 'result', 'history', 'support'];
    let currentView = 'home';
    const SUSPEND_MESSAGE = '途中までの解答は保存され、ホームの「続きから再開」で再開できます。';

    function viewFromHash() {
        const v = decodeURIComponent(location.hash.replace(/^#/, ''));
        return VIEWS.includes(v) ? v : 'home';
    }

    function showView(viewName) {
        VIEWS.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.classList.toggle('hidden', v !== viewName);
        });
        currentView = viewName;
        document.querySelectorAll('[data-nav]').forEach(btn => {
            if (btn.dataset.nav === viewName) btn.setAttribute('aria-current', 'page');
            else btn.removeAttribute('aria-current');
        });
        if (viewName === 'history') renderHistoryChart();
        if (viewName === 'home') renderResumeBanner();
    }

    // 演習中に別画面へ移るときは確認し、OKなら中断（進捗は保存）する。キャンセルなら false
    async function confirmLeaveExam(nextView) {
        if (!(window.appState.examInProgress && currentView === 'exam' && nextView !== 'exam')) return true;
        const ok = await appConfirm(SUSPEND_MESSAGE, { title: '演習を中断しますか？', okLabel: '中断する', cancelLabel: '演習を続ける' });
        // 確認中に演習が終わった・別の操作で離れた場合は何もしない
        if (!ok || !window.appState.examInProgress || currentView !== 'exam') return false;
        suspendExamSession();
        return true;
    }

    // 画面を切り替える。演習中は確認ダイアログを出すため Promise<boolean> を返す
    window.navigateTo = async function(viewName) {
        if (!VIEWS.includes(viewName)) viewName = 'home';
        if (!(await confirmLeaveExam(viewName))) return false;
        showView(viewName);
        const hash = `#${viewName}`;
        if (location.hash !== hash) history.pushState({ view: viewName }, '', hash);
        return true;
    };

    window.addEventListener('popstate', () => {
        const view = viewFromHash();
        if (window.appState.examInProgress && currentView === 'exam' && view !== 'exam') {
            // いったん演習画面の URL に戻し、確認して OK なら改めて移動する
            history.pushState({ view: 'exam' }, '', '#exam');
            navigateTo(view);
            return;
        }
        // 進行中の演習や表示できる結果がないのに演習・結果画面へ戻った場合はホームへ
        if ((view === 'exam' && !window.appState.examInProgress) || (view === 'result' && !window.appState.hasResult)) {
            history.replaceState({ view: 'home' }, '', '#home');
            showView('home');
            return;
        }
        showView(view);
    });

    // ===== 演習の中断・再開（リロードやタブを閉じても続きから解ける） =====
    const ACTIVE_SESSION_KEY = `quailq:${appId}:active-session:v1`;
    const ACTIVE_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

    function saveActiveSession() {
        if (!window.appState.examInProgress) return;
        try {
            localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
                v: 1,
                savedAt: Date.now(),
                badge: document.getElementById('exam-badge').textContent,
                questions: window.appState.currentExamQuestions,
                index: window.appState.currentQuestionIndex,
                answers: window.appState.selectedAnswers,
                revealed: window.appState.revealed,
                mode: window.appState.sessionMode,
                meta: window.appState.sessionMeta,
                elapsed: window.appState.elapsedSeconds
            }));
        } catch (_) { /* 保存できない環境では中断データを残さない */ }
    }

    function loadActiveSession() {
        try {
            const d = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY));
            if (!d || d.v !== 1 || !Array.isArray(d.questions) || d.questions.length === 0) return null;
            if (Date.now() - (d.savedAt || 0) > ACTIVE_SESSION_MAX_AGE_MS) {
                clearActiveSession();
                return null;
            }
            return d;
        } catch (_) {
            return null;
        }
    }

    function clearActiveSession() {
        try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch (_) {}
    }

    function suspendExamSession() {
        saveActiveSession();
        clearInterval(window.appState.timerInterval);
        window.appState.examInProgress = false;
    }

    function formatSeconds(sec) {
        return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }

    function renderResumeBanner() {
        const banner = document.getElementById('resume-banner');
        if (!banner) return;
        const d = window.appState.examInProgress ? null : loadActiveSession();
        banner.classList.toggle('hidden', !d);
        // hidden 属性も合わせる（space-y-* の間隔計算から非表示の要素を外すため）
        banner.hidden = !d;
        if (!d) return;
        const answered = Object.keys(d.answers || {}).length;
        document.getElementById('resume-banner-detail').textContent =
            `「${d.badge}」 ${answered} / ${d.questions.length}問 解答済み・経過時間 ${formatSeconds(d.elapsed || 0)}`;
    }

    window.resumeSavedSession = function() {
        const d = loadActiveSession();
        if (!d) {
            renderResumeBanner();
            showModal("再開できません", "中断した演習のデータが見つかりませんでした。");
            return;
        }
        const appState = window.appState;
        appState.currentExamQuestions = d.questions;
        appState.currentQuestionIndex = Math.min(Math.max(d.index || 0, 0), d.questions.length - 1);
        appState.selectedAnswers = d.answers || {};
        appState.revealed = d.revealed || {};
        appState.sessionMode = d.mode === 'instant' ? 'instant' : 'batch';
        appState.sessionMeta = normalizeSessionMeta(d.meta || {}, d.badge || '');
        appState.elapsedSeconds = d.elapsed || 0;
        appState.examInProgress = true;
        appState.hasResult = false;

        document.getElementById('exam-badge').textContent = d.badge || '演習';
        document.getElementById('total-q-num').textContent = d.questions.length;
        document.getElementById('timer-display').textContent = formatSeconds(appState.elapsedSeconds);
        startTimer();
        renderCurrentQuestion();
        navigateTo('exam');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.discardSavedSession = async function() {
        if (!(await appConfirm('途中までの解答は失われます。', { title: '中断した演習を破棄しますか？', okLabel: '破棄する', danger: true }))) return;
        clearActiveSession();
        renderResumeBanner();
    };

    window.addEventListener('pagehide', saveActiveSession);

    // ===== キーボード操作 =====
    function isModalOpen(id) {
        const el = document.getElementById(id);
        return !!el && !el.classList.contains('hidden');
    }

    document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === 'Escape') {
            if (isModalOpen('app-modal')) { closeModal(false); e.preventDefault(); }
            else if (isModalOpen('custom-exam-modal')) { closeCustomExamModal(); e.preventDefault(); }
            return;
        }

        if (currentView !== 'exam' || !window.appState.examInProgress) return;
        if (isModalOpen('app-modal') || isModalOpen('custom-exam-modal')) return;
        const target = e.target;
        if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;

        const appState = window.appState;
        const idx = appState.currentQuestionIndex;
        const q = appState.currentExamQuestions[idx];
        if (!q) return;

        if (['1', '2', '3', '4'].includes(e.key)) {
            const optIdx = Number(e.key) - 1;
            if (optIdx < q.options.length) {
                handleOptionSelect(idx, optIdx);
                e.preventDefault();
            }
        } else if (e.key === 'Enter') {
            // 問題カード以外のボタン（ヘッダーなど）にフォーカスがあるときはブラウザ標準の動作に任せる
            if (target && target.tagName === 'BUTTON' && !target.closest('#single-question-card')) return;
            e.preventDefault();
            if (appState.selectedAnswers[idx] !== undefined) confirmAnswerAndNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevQuestion();
        } else if (e.key === 'ArrowRight') {
            // 最後の問題では採点へ進まない（誤操作防止）
            if (idx < appState.currentExamQuestions.length - 1) {
                e.preventDefault();
                nextQuestion();
            }
        } else if (e.key === 'b' || e.key === 'B') {
            if (q.qid) {
                e.preventDefault();
                toggleBookmark(q.qid);
            }
        }
    });

    window.scrollToExams = function() {
        const el = document.getElementById('exams-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // --- 検定グリッドの動的レンダリング & フィルタリング ---
    // 選択状態は appState から描画する（グローバルな event に頼らず、各タブ本来の色も保つ）
    const ACTIVE_TAB_CLASS = 'cat-btn px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 border bg-brand-600 border-brand-600 text-white';

    function renderCategoryTabs() {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (!btn.dataset.baseClass) btn.dataset.baseClass = btn.className;
            const active = btn.dataset.category === window.appState.activeCategory;
            btn.className = active ? ACTIVE_TAB_CLASS : btn.dataset.baseClass;
            btn.setAttribute('aria-pressed', String(active));
        });
    }

    window.filterCategory = function(cat) {
        window.appState.activeCategory = cat;
        renderCategoryTabs();
        renderExamsGrid();
    };

    window.filterExams = function() {
        window.appState.searchQuery = document.getElementById('exam-search-input').value.toLowerCase().trim();
        renderExamsGrid();
    };

    function renderExamsGrid() {
        const grid = document.getElementById('exams-grid');
        const catFilter = window.appState.activeCategory;
        const queryStr = window.appState.searchQuery;

        let allExams = [
            ...MASTER_EXAMS_CATALOG,
            ...window.appState.customExams.map(ce => ({
                id: ce.id,
                name: ce.name,
                category: ce.category || '教養・学術・その他',
                badge: '自作検定',
                color: 'amber',
                icon: 'fa-user-pen',
                desc: ce.desc || 'ユーザーが作成したオリジナル問題セット',
                isCustom: true,
                questions: Array.isArray(ce.questions) ? ce.questions : []
            }))
        ];

        let filtered = allExams.filter(exam => {
            if (catFilter === 'CUSTOM') {
                if (!exam.isCustom) return false;
            } else if (catFilter !== 'ALL') {
                if (exam.category !== catFilter) return false;
            }

            if (queryStr) {
                const matchName = exam.name.toLowerCase().includes(queryStr);
                const matchDesc = exam.desc.toLowerCase().includes(queryStr);
                const matchCat = exam.category.toLowerCase().includes(queryStr);
                return matchName || matchDesc || matchCat;
            }

            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-300 mb-3"></i>
                    <p class="text-slate-600 font-bold">該当する検定が見つかりません</p>
                    <p class="text-xs text-slate-400 mt-1 mb-4">検索条件を変更するか、新しいオリジナル検定を作成してください。</p>
                    <button onclick="openCustomExamModal()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold">
                        <i class="fa-solid fa-plus mr-1"></i> オリジナル検定を作成
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(exam => `
            <div data-exam-id="${escapeHtml(exam.id)}" onclick="onExamCardClick(event, this.dataset.examId)" class="group focus-within:ring-2 focus-within:ring-brand-500 p-5 bg-white hover:bg-brand-50/50 border border-slate-200 hover:border-brand-300 rounded-2xl transition shadow-sm hover:shadow-md text-left flex flex-col justify-between cursor-pointer relative overflow-hidden">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-500 group-hover:text-white text-brand-600 flex items-center justify-center text-xl transition shrink-0">
                            <i class="fa-solid ${escapeHtml(exam.icon)}"></i>
                        </div>
                        <span class="flex items-center gap-1">
                            ${exam.isCustom ? `
                            <button type="button" data-exam-id="${escapeHtml(exam.id)}" onclick="event.stopPropagation(); openCustomExamModal(this.dataset.examId)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white transition" title="編集" aria-label="${escapeHtml(exam.name)}を編集">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button type="button" data-exam-id="${escapeHtml(exam.id)}" onclick="event.stopPropagation(); deleteCustomExam(this.dataset.examId)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition" title="削除" aria-label="${escapeHtml(exam.name)}を削除">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>` : ''}
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 group-hover:bg-brand-100">
                                ${escapeHtml(exam.badge)}
                            </span>
                        </span>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base group-hover:text-brand-600 transition mb-1">
                        <button type="button" data-exam-id="${escapeHtml(exam.id)}" onclick="startExamById(this.dataset.examId)" class="text-left focus:outline-none"
                            aria-label="${escapeHtml(exam.name)}の演習を開始（${Math.min(exam.questions.length, SESSION_MAX_QUESTIONS)}問）">${escapeHtml(exam.name)}</button>
                    </h4>
                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">${escapeHtml(exam.desc)}</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-brand-600">
                    <span>${escapeHtml(exam.questions.length)}問 収録</span>
                    <span class="flex items-center space-x-1">
                        <span>${Math.min(exam.questions.length, SESSION_MAX_QUESTIONS)}問演習を開始</span>
                        <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </span>
                </div>
            </div>
        `).join('');
    }

    // カードのどこをクリックしても開始する（カード内のボタンはそれぞれの動作を優先）
    window.onExamCardClick = function(e, examId) {
        if (e.target.closest('button')) return;
        startExamById(examId);
    };

    // --- オリジナル自作検定の作成・編集 ---
    const CUSTOM_MAX_QUESTIONS = 100;
    const OPTION_LABELS = ['ア', 'イ', 'ウ', 'エ'];
    let editingExamId = null;

    function newQuestionId() {
        return `cq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function blankQuestion() {
        return { qid: newQuestionId(), title: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
    }

    function isBlankQuestion(q) {
        return !q.title && !q.explanation && q.options.every(o => !o);
    }

    function renderEditorQuestions(questions) {
        const container = document.getElementById('cust-questions');
        container.innerHTML = questions.map((q, i) => `
            <div class="cust-q-block p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2" data-qid="${escapeHtml(q.qid)}">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-700">問題 ${i + 1}</span>
                    <button type="button" onclick="removeEditorQuestion(${i})" class="text-slate-400 hover:text-rose-600 text-xs font-bold" aria-label="問題${i + 1}を削除">
                        <i class="fa-solid fa-trash-can mr-1"></i>削除
                    </button>
                </div>
                <textarea class="cust-q-title w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500" rows="2" maxlength="1000" placeholder="問題文" aria-label="問題${i + 1}の問題文">${escapeHtml(q.title)}</textarea>
                <div class="space-y-1.5">
                    ${q.options.map((opt, k) => `
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1 shrink-0 cursor-pointer" title="正解にする">
                                <input type="radio" name="cust-correct-${i}" value="${k}" ${q.correctIndex === k ? 'checked' : ''} class="accent-emerald-600">
                                <span class="w-5 font-bold text-slate-600">${OPTION_LABELS[k]}</span>
                            </label>
                            <input type="text" class="cust-q-opt flex-1 px-3 py-1.5 border border-slate-300 rounded-lg" maxlength="300" value="${escapeHtml(opt)}" placeholder="選択肢 ${OPTION_LABELS[k]}" aria-label="問題${i + 1}の選択肢${OPTION_LABELS[k]}">
                        </div>
                    `).join('')}
                    <p class="text-[11px] text-slate-400">左の丸で正解の選択肢を選んでください（出題時は選択肢の順番がシャッフルされます）</p>
                </div>
                <textarea class="cust-q-exp w-full px-3 py-2 border border-slate-300 rounded-xl" rows="2" maxlength="1000" placeholder="解説（任意）" aria-label="問題${i + 1}の解説">${escapeHtml(q.explanation === '解説なし' ? '' : q.explanation)}</textarea>
            </div>
        `).join('');
        document.getElementById('cust-q-count').textContent = questions.length;
    }

    function collectEditorQuestions() {
        return [...document.querySelectorAll('#cust-questions .cust-q-block')].map(block => {
            const checked = block.querySelector('input[type="radio"]:checked');
            return {
                qid: block.dataset.qid || newQuestionId(),
                title: block.querySelector('.cust-q-title').value.trim(),
                options: [...block.querySelectorAll('.cust-q-opt')].map(input => input.value.trim()),
                correctIndex: checked ? parseInt(checked.value, 10) : 0,
                explanation: block.querySelector('.cust-q-exp').value.trim()
            };
        });
    }

    window.addEditorQuestion = function() {
        const qs = collectEditorQuestions();
        if (qs.length >= CUSTOM_MAX_QUESTIONS) {
            showModal("上限に達しました", `1つの検定に登録できる問題は${CUSTOM_MAX_QUESTIONS}問までです。`);
            return;
        }
        qs.push(blankQuestion());
        renderEditorQuestions(qs);
        const titles = document.querySelectorAll('#cust-questions .cust-q-title');
        titles[titles.length - 1].focus();
    };

    window.removeEditorQuestion = function(index) {
        const qs = collectEditorQuestions();
        qs.splice(index, 1);
        renderEditorQuestions(qs.length > 0 ? qs : [blankQuestion()]);
    };

    window.openCustomExamModal = function(examId) {
        const form = document.getElementById('custom-exam-form');
        form.reset();
        document.getElementById('cust-import-text').value = '';
        const exam = examId ? window.appState.customExams.find(e => e.id === examId) : null;
        editingExamId = exam ? exam.id : null;

        document.getElementById('cust-modal-title').textContent = exam ? 'オリジナル検定の編集' : 'オリジナル検定の作成';
        document.getElementById('cust-save-btn').textContent = exam ? '変更を保存' : '検定を作成';

        if (exam) {
            document.getElementById('cust-exam-title').value = exam.name || '';
            document.getElementById('cust-exam-cat').value = exam.category || '教養・学術・その他';
            const desc = exam.desc || '';
            document.getElementById('cust-exam-passline').value = exam.passLine || DEFAULT_PASS_LINE;
            document.getElementById('cust-exam-desc').value = /^(ユーザーが自作したオリジナル20問セット|自作問題 \d+問)$/.test(desc) ? '' : desc;
            // 以前の形式の問題には「検定ID-番号」の qid を付けて、これまでの学習記録を引き継ぐ
            const qs = (Array.isArray(exam.questions) ? exam.questions : []).map((q, i) => ({
                qid: q.qid || `${exam.id}-${i + 1}`,
                title: stripTitlePrefix(q.title),
                options: [0, 1, 2, 3].map(k => (q.options && q.options[k]) || ''),
                correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
                explanation: q.explanation || ''
            }));
            renderEditorQuestions(qs.length > 0 ? qs : [blankQuestion()]);
        } else {
            renderEditorQuestions([blankQuestion()]);
        }
        openDialog(document.getElementById('custom-exam-modal'), document.getElementById('cust-exam-title'));
    };

    window.closeCustomExamModal = function() {
        closeDialog(document.getElementById('custom-exam-modal'));
        editingExamId = null;
    };

    window.deleteCustomExam = async function(examId) {
        const exam = window.appState.customExams.find(e => e.id === examId);
        if (!exam) return;
        if (!(await appConfirm('この操作は取り消せません。', { title: `「${exam.name}」を削除しますか？`, okLabel: '削除する', danger: true }))) return;
        removeRecords('customExams', [examId]);
    };

    window.handleSaveCustomExam = function(e) {
        e.preventDefault();
        const name = document.getElementById('cust-exam-title').value.trim();
        const category = document.getElementById('cust-exam-cat').value;
        const descInput = document.getElementById('cust-exam-desc').value.trim();
        const passLineInput = Number(document.getElementById('cust-exam-passline').value);
        const questions = collectEditorQuestions().filter(q => !isBlankQuestion(q));

        const errors = [];
        if (!name) errors.push('検定名を入力してください。');
        if (!Number.isInteger(passLineInput) || passLineInput < 1 || passLineInput > 100) errors.push('合格ラインは 1〜100 の整数で入力してください。');
        if (questions.length === 0) errors.push('問題を1問以上入力してください。');
        if (questions.length > CUSTOM_MAX_QUESTIONS) errors.push(`問題は${CUSTOM_MAX_QUESTIONS}問までです。`);
        collectEditorQuestions().forEach((q, i) => {
            if (isBlankQuestion(q)) return;
            const missing = [];
            if (!q.title) missing.push('問題文');
            q.options.forEach((o, k) => { if (!o) missing.push(`選択肢${OPTION_LABELS[k]}`); });
            if (missing.length > 0) errors.push(`問題${i + 1}: ${missing.join('・')}が未入力です。`);
        });
        if (errors.length > 0) {
            showModal("入力内容を確認してください", errors.slice(0, 6).join('\n') + (errors.length > 6 ? `\nほか${errors.length - 6}件` : ''));
            return;
        }

        const existing = editingExamId ? window.appState.customExams.find(ex => ex.id === editingExamId) : null;
        const now = new Date().toISOString();
        const data = {
            name,
            category,
            desc: descInput || `自作問題 ${questions.length}問`,
            passLine: passLineInput,
            createdAt: (existing && existing.createdAt) || now,
            updatedAt: now,
            questions: questions.map(q => ({
                qid: q.qid,
                title: q.title,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation || '解説なし'
            }))
        };

        if (existing) {
            updateRecord('customExams', existing.id, data);
        } else {
            addRecord('customExams', data);
        }
        closeCustomExamModal();
        showModal(existing ? "検定を更新しました" : "検定を作成しました", `「${name}」（${questions.length}問）を保存しました。`);
    };

    // --- 問題の一括取り込み（CSV / TSV / JSON） ---
    function parseDelimited(text, delim) {
        const rows = [];
        let row = [], field = '', inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
                } else {
                    field += c;
                }
            } else if (c === '"' && field === '') {
                inQuotes = true;
            } else if (c === delim) {
                row.push(field); field = '';
            } else if (c === '\n' || c === '\r') {
                if (c === '\r' && text[i + 1] === '\n') i++;
                row.push(field); rows.push(row); row = []; field = '';
            } else {
                field += c;
            }
        }
        if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
        return rows.filter(r => r.some(f => f.trim() !== ''));
    }

    function parseAnswerIndex(value, options) {
        if (typeof value === 'number' && Number.isInteger(value)) {
            return value >= 0 && value <= 3 ? value : -1;
        }
        const v = String(value || '').trim();
        const map = { 'ア': 0, 'イ': 1, 'ウ': 2, 'エ': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3, '１': 0, '２': 1, '３': 2, '４': 3 };
        if (v in map) return map[v];
        const byText = options.indexOf(v);
        return byText;
    }

    function parseQuestionsText(raw) {
        const text = String(raw || '').replace(/^\uFEFF/, '').trim();
        const questions = [];
        const errors = [];
        if (!text) return { questions, errors: ['取り込む内容が空です。'] };

        const toQuestion = (title, options, answer, explanation, where) => {
            const opts = (options || []).map(o => String(o ?? '').trim());
            if (!String(title || '').trim()) { errors.push(`${where}: 問題文がありません`); return; }
            if (opts.length !== 4 || opts.some(o => !o)) { errors.push(`${where}: 選択肢は4つ必要です`); return; }
            const idx = parseAnswerIndex(answer, opts);
            if (idx < 0) { errors.push(`${where}: 正解「${answer}」を判別できません`); return; }
            questions.push({
                qid: newQuestionId(),
                title: String(title).trim().slice(0, 1000),
                options: opts.map(o => o.slice(0, 300)),
                correctIndex: idx,
                explanation: String(explanation || '').trim().slice(0, 1000)
            });
        };

        if (text.startsWith('[') || text.startsWith('{')) {
            let data;
            try { data = JSON.parse(text); } catch (e) { return { questions, errors: ['JSON の形式が正しくありません。'] }; }
            const list = Array.isArray(data) ? data : (Array.isArray(data.questions) ? data.questions : null);
            if (!list) return { questions, errors: ['JSON は問題の配列、または { "questions": [...] } の形にしてください。'] };
            list.forEach((item, i) => {
                if (!item || typeof item !== 'object') { errors.push(`${i + 1}件目: 形式が正しくありません`); return; }
                const answer = item.correctIndex !== undefined ? item.correctIndex : item.answer;
                toQuestion(item.title ?? item.question, item.options ?? item.choices, answer, item.explanation, `${i + 1}件目`);
            });
        } else {
            const firstLine = text.split(/\r?\n/)[0];
            const delim = firstLine.includes('\t') ? '\t' : ',';
            const rows = parseDelimited(text, delim);
            rows.forEach((cells, i) => {
                if (i === 0 && /問題|question/i.test(cells[0] || '') && /正解|answer/i.test(cells.join(' '))) return; // 見出し行
                const [title, o1, o2, o3, o4, answer, ...rest] = cells;
                toQuestion(title, [o1, o2, o3, o4], answer, rest.join(delim === '\t' ? ' ' : ','), `${i + 1}行目`);
            });
        }
        return { questions, errors };
    }

    function applyImportedQuestions(raw) {
        const { questions, errors } = parseQuestionsText(raw);
        const current = collectEditorQuestions().filter(q => !isBlankQuestion(q));
        const room = CUSTOM_MAX_QUESTIONS - current.length;
        const accepted = questions.slice(0, Math.max(room, 0));
        if (questions.length > accepted.length) errors.push(`上限（${CUSTOM_MAX_QUESTIONS}問）を超えた${questions.length - accepted.length}問は取り込みませんでした`);
        const merged = [...current, ...accepted];
        renderEditorQuestions(merged.length > 0 ? merged : [blankQuestion()]);

        const lines = [`${accepted.length}問を取り込みました。内容を確認してから保存してください。`];
        if (errors.length > 0) {
            lines.push(`取り込めなかった行: ${errors.length}件`);
            lines.push(...errors.slice(0, 5));
            if (errors.length > 5) lines.push(`ほか${errors.length - 5}件`);
        }
        showModal(accepted.length > 0 ? "取り込み完了" : "取り込めませんでした", lines.join('\n'));
        if (accepted.length > 0) document.getElementById('cust-import-text').value = '';
    }

    window.importQuestionsFromText = function() {
        applyImportedQuestions(document.getElementById('cust-import-text').value);
    };

    window.importQuestionsFromFile = function(input) {
        const file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        if (file.size > 1024 * 1024) {
            showModal("取り込めませんでした", "ファイルが大きすぎます（1MBまで）。");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => applyImportedQuestions(reader.result);
        reader.onerror = () => showModal("取り込めませんでした", "ファイルを読み込めませんでした。");
        reader.readAsText(file, 'UTF-8');
    };

    // --- タスク管理 ---
    window.handleAddTask = async function(e) {
        e.preventDefault();
        const input = document.getElementById('task-title-input');
        const title = input.value.trim();
        if (!title) return;

        const newTask = { title, createdAt: new Date().toISOString(), completed: false };

        addRecord('tasks', newTask);
        input.value = '';
    };

    window.deleteTask = function(taskId) {
        removeRecords('tasks', [taskId]);
    };

    window.toggleTask = function(taskId) {
        const task = window.appState.tasks.find(t => t.id === taskId);
        if (!task) return;
        const completed = !task.completed;
        updateRecord('tasks', taskId, {
            ...task,
            completed,
            completedAt: completed ? new Date().toISOString() : null
        });
    };

    function formatDate(iso) {
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    }

    function renderTasks() {
        const container = document.getElementById('tasks-list');
        const countEl = document.getElementById('task-count');
        // 未完了を上、完了済みを下に（それぞれ登録順）
        const tasks = [...window.appState.tasks].sort((a, b) =>
            (!!a.completed - !!b.completed) || ((Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0)));
        const remaining = tasks.filter(t => !t.completed).length;

        countEl.textContent = tasks.length === 0 ? '0件' : `残り${remaining}件 / 全${tasks.length}件`;

        if (tasks.length === 0) {
            container.innerHTML = `<div class="text-center py-6 text-slate-400 text-sm">目標タスクはまだありません。上のフォームから追加してください。</div>`;
            return;
        }

        container.innerHTML = tasks.map(t => `
            <div class="flex items-center justify-between p-3.5 border rounded-xl transition ${t.completed ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/80 hover:border-brand-300'}">
                <button type="button" data-task-id="${escapeHtml(t.id)}" onclick="toggleTask(this.dataset.taskId)" aria-pressed="${!!t.completed}"
                    class="flex items-center space-x-3 text-left flex-1 min-w-0" title="${t.completed ? '未完了に戻す' : '達成済みにする'}">
                    <i class="${t.completed ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle text-slate-400'} text-lg shrink-0"></i>
                    <span class="font-medium text-sm truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}">${escapeHtml(t.title)}</span>
                    ${t.completed && t.completedAt ? `<span class="text-[11px] text-emerald-600 shrink-0">${escapeHtml(formatDate(t.completedAt))} 達成</span>` : ''}
                </button>
                <button data-task-id="${escapeHtml(t.id)}" onclick="deleteTask(this.dataset.taskId)" aria-label="目標を削除" class="text-slate-400 hover:text-rose-500 p-1 transition shrink-0">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
            </div>
        `).join('');
    }

    // --- 演習セッション開始処理 ---
    const SESSION_MAX_QUESTIONS = 20;   // 1回の演習で出題する最大問題数
    const DEFAULT_PASS_LINE = 70;       // 合格ラインの既定値（%）

    // Fisher–Yates シャッフル（元配列は変更しない）
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // 選択肢の並びをシャッフルし、正解インデックスを付け替える
    function shuffleOptions(q) {
        const order = shuffleArray(q.options.map((_, i) => i));
        return {
            ...q,
            options: order.map(i => q.options[i]),
            correctIndex: order.indexOf(q.correctIndex)
        };
    }

    // 指定した検定群から重複なしの問題プールを作る
    function buildQuestionPool(exams) {
        const seen = new Set();
        const pool = [];
        exams.forEach(ex => {
            ex.questions.forEach(q => {
                const key = q.title + '\u0000' + q.options.join('\u0000');
                if (seen.has(key)) return;
                seen.add(key);
                pool.push({ ...q, examId: ex.id, examName: ex.name, category: ex.category });
            });
        });
        return pool;
    }

    window.startExamById = function(examId) {
        let found = MASTER_EXAMS_CATALOG.find(e => e.id === examId);
        if (!found) {
            found = window.appState.customExams.find(e => e.id === examId);
        }

        if (found && Array.isArray(found.questions) && found.questions.length > 0) {
            // qid は元の並び順で決めてから、21問以上ある自作検定はランダムに20問を選ぶ
            const withIds = found.questions.map((q, idx) => ({ ...q, qid: q.qid || `${found.id}-${idx + 1}` }));
            const picked = withIds.length > SESSION_MAX_QUESTIONS ? shuffleArray(withIds).slice(0, SESSION_MAX_QUESTIONS) : withIds;
            const formattedQuestions = picked.map(q => ({
                ...q,
                title: stripTitlePrefix(q.title),
                examId: found.id,
                examName: found.name,
                category: found.category || '教養・学術・その他'
            }));
            initExamSession(formattedQuestions, `${found.name} (全${formattedQuestions.length}問)`, {
                groupName: found.name,
                passLine: found.passLine,
                passNote: found.passNote || ''
            });
        } else {
            showModal("開始できません", "この検定には問題が登録されていません。");
        }
    };

    window.startExam = function(type) {
        if (type === 'latest') {
            const selected = shuffleArray(buildQuestionPool(MASTER_EXAMS_CATALOG)).slice(0, SESSION_MAX_QUESTIONS);
            initExamSession(selected, `全検定ミックス総合テスト (${selected.length}問)`, { groupName: '全検定ミックス' });
        }
    };

    window.startExamByCategory = function() {
        const cat = document.getElementById('mix-category-select').value;
        const exams = MASTER_EXAMS_CATALOG.filter(ex => ex.category === cat);
        const selected = shuffleArray(buildQuestionPool(exams)).slice(0, SESSION_MAX_QUESTIONS);
        if (selected.length === 0) {
            showModal("開始できません", "このカテゴリには問題がありません。");
            return;
        }
        initExamSession(selected, `${cat} ミックス (${selected.length}問)`, { groupName: `${cat} ミックス` });
    };

    // ===== 学習記録・復習機能 =====
    // 間隔反復：連続正解数に応じて次の出題までの日数を伸ばす（不正解なら 0 日＝すぐ復習）
    const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60];
    const DAY_MS = 24 * 60 * 60 * 1000;
    const WEAK_THRESHOLD = 60;
    const WEAK_MIN_ATTEMPTS = 5;

    function getAllExamsForIndex() {
        return [
            ...MASTER_EXAMS_CATALOG,
            ...window.appState.customExams.map(ce => ({
                id: ce.id,
                name: ce.name,
                category: ce.category || '教養・学術・その他',
                questions: Array.isArray(ce.questions) ? ce.questions : []
            }))
        ];
    }

    // qid → 問題データ（検定名・分野つき）
    function buildQuestionIndex() {
        const index = new Map();
        getAllExamsForIndex().forEach(ex => {
            ex.questions.forEach((q, i) => {
                const qid = q.qid || `${ex.id}-${i + 1}`;
                index.set(qid, { ...q, title: stripTitlePrefix(q.title), qid, examId: ex.id, examName: ex.name, category: ex.category });
            });
        });
        return index;
    }

    // 履歴に保存した問題ごとの正誤から、問題単位の成績を作る
    function computeQuestionStats() {
        const stats = new Map();
        const chronological = [...window.appState.history]
            .sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0));
        chronological.forEach(rec => {
            if (!Array.isArray(rec.answers)) return; // 問題ごとの記録がない古い履歴は対象外
            const at = Date.parse(rec.createdAt) || 0;
            rec.answers.forEach(a => {
                if (!a || !a.qid) return;
                const s = stats.get(a.qid) || { qid: a.qid, attempts: 0, correct: 0, streak: 0, lastCorrect: false, lastAt: 0 };
                s.attempts++;
                if (a.correct) { s.correct++; s.streak++; } else { s.streak = 0; }
                s.lastCorrect = !!a.correct;
                s.lastAt = at;
                s.examId = a.examId || s.examId;
                s.examName = a.examName || s.examName;
                s.category = a.category || s.category;
                stats.set(a.qid, s);
            });
        });
        return stats;
    }

    function nextReviewAt(s) {
        if (!s.lastCorrect) return s.lastAt;
        const days = REVIEW_INTERVAL_DAYS[Math.min(s.streak, REVIEW_INTERVAL_DAYS.length - 1)];
        return s.lastAt + days * DAY_MS;
    }

    function getReviewQids(kind, stats, index) {
        const now = Date.now();
        let qids = [];
        if (kind === 'wrong') {
            qids = [...stats.values()]
                .filter(s => !s.lastCorrect)
                .sort((a, b) => b.lastAt - a.lastAt)
                .map(s => s.qid);
        } else if (kind === 'due') {
            qids = [...stats.values()]
                .filter(s => nextReviewAt(s) <= now)
                .sort((a, b) => (a.lastCorrect - b.lastCorrect) || (nextReviewAt(a) - nextReviewAt(b)))
                .map(s => s.qid);
        } else if (kind === 'bookmarks') {
            qids = sortHistory(window.appState.bookmarks).map(b => b.qid);
        }
        return [...new Set(qids)].filter(qid => index.has(qid));
    }

    const REVIEW_LABELS = { due: '今日の復習', wrong: '間違えた問題の復習', bookmarks: 'ブックマークした問題' };

    window.startReviewSession = function(kind) {
        const index = buildQuestionIndex();
        const qids = getReviewQids(kind, computeQuestionStats(), index);
        if (qids.length === 0) {
            showModal(REVIEW_LABELS[kind] || '復習', '対象の問題はありません。');
            return;
        }
        // 優先度の高い順に最大20問を選び、出題順はシャッフル
        const selected = shuffleArray(qids.slice(0, SESSION_MAX_QUESTIONS).map(qid => index.get(qid)));
        initExamSession(selected, `${REVIEW_LABELS[kind]} (${selected.length}問)`, { groupName: REVIEW_LABELS[kind] });
    };

    window.retryLastWrong = function() {
        const qs = window.appState.lastWrongQuestions || [];
        if (qs.length === 0) return;
        initExamSession(qs, `間違えた問題の解き直し (${qs.length}問)`, { groupName: '間違えた問題の解き直し' });
    };

    function weaknessRowsHtml(groups) {
        if (groups.length === 0) {
            return '<p class="text-xs text-slate-400">まだデータがありません。演習すると、ここに分野・検定ごとの正答率が表示されます。</p>';
        }
        return groups.map(g => {
            const rate = Math.round((g.correct / g.attempts) * 100);
            const isWeak = rate < WEAK_THRESHOLD && g.attempts >= WEAK_MIN_ATTEMPTS;
            const barColor = rate < WEAK_THRESHOLD ? 'bg-rose-500' : rate < 80 ? 'bg-amber-400' : 'bg-emerald-500';
            return `
                <div>
                    <div class="flex items-center justify-between text-xs mb-1 gap-2">
                        <span class="font-semibold text-slate-700 truncate">
                            ${escapeHtml(g.name)}
                            ${isWeak ? '<span class="ml-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">苦手</span>' : ''}
                        </span>
                        <span class="text-slate-500 shrink-0"><span class="font-bold text-slate-800">${rate}%</span> (${g.correct}/${g.attempts})</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 overflow-hidden" role="img" aria-label="${escapeHtml(g.name)} 正答率${rate}%">
                        <div class="h-2 rounded-full ${barColor}" style="width: ${rate}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function groupStats(stats, keyFn) {
        const groups = new Map();
        stats.forEach(s => {
            const name = keyFn(s) || 'その他';
            const g = groups.get(name) || { name, attempts: 0, correct: 0 };
            g.attempts += s.attempts;
            g.correct += s.correct;
            groups.set(name, g);
        });
        return [...groups.values()].sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts) || b.attempts - a.attempts);
    }

    // 復習パネルの件数と苦手分析を更新する
    function renderLearningInsights() {
        const stats = computeQuestionStats();
        const index = buildQuestionIndex();

        ['due', 'wrong', 'bookmarks'].forEach(kind => {
            const count = getReviewQids(kind, stats, index).length;
            const countEl = document.getElementById(`review-count-${kind}`);
            const btn = document.getElementById(`review-btn-${kind}`);
            if (countEl) countEl.textContent = count;
            if (btn) btn.disabled = count === 0;
        });
        const hint = document.getElementById('review-hint');
        if (hint) {
            hint.textContent = stats.size === 0
                ? '演習すると問題ごとの正誤が記録され、間違えた問題の解き直しや復習に使えるようになります。'
                : `これまでに ${stats.size} 問の正誤を記録しています。正解が続いた問題ほど、次の復習までの間隔が長くなります（1日→3日→7日→14日→30日→60日）。`;
        }

        const byCat = document.getElementById('weak-by-category');
        const byExam = document.getElementById('weak-by-exam');
        if (byCat) byCat.innerHTML = weaknessRowsHtml(groupStats(stats, s => s.category));
        if (byExam) byExam.innerHTML = weaknessRowsHtml(groupStats(stats, s => s.examName));
    }

    // --- ブックマーク ---
    function isBookmarked(qid) {
        return window.appState.bookmarks.some(b => b.qid === qid);
    }

    function bookmarkInnerHtml(on) {
        return on
            ? '<i class="fa-solid fa-bookmark mr-1"></i>ブックマーク済み'
            : '<i class="fa-regular fa-bookmark mr-1"></i>ブックマーク';
    }

    function bookmarkButtonHtml(qid) {
        if (!qid) return '';
        const on = isBookmarked(qid);
        return `<button type="button" data-bookmark-qid="${escapeHtml(qid)}" onclick="toggleBookmark(this.dataset.bookmarkQid)" aria-pressed="${on}"
            class="text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-amber-50 transition ${on ? 'text-amber-600' : 'text-slate-400'}">${bookmarkInnerHtml(on)}</button>`;
    }

    function refreshBookmarkButtons() {
        document.querySelectorAll('[data-bookmark-qid]').forEach(btn => {
            const on = isBookmarked(btn.dataset.bookmarkQid);
            btn.innerHTML = bookmarkInnerHtml(on);
            btn.classList.toggle('text-amber-600', on);
            btn.classList.toggle('text-slate-400', !on);
            btn.setAttribute('aria-pressed', String(on));
        });
    }

    window.toggleBookmark = function(qid) {
        if (!qid) return;
        const existing = window.appState.bookmarks.filter(b => b.qid === qid);
        if (existing.length > 0) {
            removeRecords('bookmarks', existing.map(b => b.id));
        } else {
            addRecord('bookmarks', { qid, createdAt: new Date().toISOString() });
        }
    };

    // --- 解答モード（まとめて採点 / 一問ずつ答え合わせ） ---
    const ANSWER_MODE_KEY = 'quailq:answer-mode';
    const ANSWER_MODE_DESC = {
        batch: 'まとめて採点：全問を解き終えてから、まとめて正誤と解説を確認します（本番形式）。',
        instant: '一問ずつ答え合わせ：解答するたびにその場で正誤と解説を表示します（学習向け）。'
    };

    try {
        if (localStorage.getItem(ANSWER_MODE_KEY) === 'instant') window.appState.answerMode = 'instant';
    } catch (_) { /* 保存領域が使えない場合は既定値のまま */ }

    function renderAnswerModeToggle() {
        const mode = window.appState.answerMode;
        document.querySelectorAll('[data-answer-mode]').forEach(btn => {
            const active = btn.dataset.answerMode === mode;
            btn.classList.toggle('bg-white', active);
            btn.classList.toggle('shadow', active);
            btn.classList.toggle('text-brand-700', active);
            btn.classList.toggle('text-slate-600', !active);
            btn.setAttribute('aria-pressed', String(active));
        });
        const desc = document.getElementById('answer-mode-desc');
        if (desc) desc.textContent = ANSWER_MODE_DESC[mode];
    }

    window.setAnswerMode = function(mode) {
        window.appState.answerMode = mode === 'instant' ? 'instant' : 'batch';
        try { localStorage.setItem(ANSWER_MODE_KEY, window.appState.answerMode); } catch (_) {}
        renderAnswerModeToggle();
    };

    // meta: { groupName: 履歴の絞り込みに使う名前, passLine: 合格ライン(%), passNote: 合格ラインの補足 }
    function initExamSession(questions, badgeTitle, meta = {}) {
        // 正解位置が偏らないよう、出題のたびに選択肢をシャッフル
        window.appState.currentExamQuestions = questions.map(shuffleOptions);
        window.appState.currentQuestionIndex = 0;
        window.appState.selectedAnswers = {};
        window.appState.revealed = {};
        window.appState.sessionMode = window.appState.answerMode;
        window.appState.elapsedSeconds = 0;
        window.appState.examInProgress = true;
        window.appState.hasResult = false;
        window.appState.sessionMeta = normalizeSessionMeta(meta, badgeTitle);
        document.getElementById('timer-display').textContent = '00:00';

        document.getElementById('exam-badge').textContent = badgeTitle;
        document.getElementById('total-q-num').textContent = questions.length;

        startTimer();
        renderCurrentQuestion();
        navigateTo('exam');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function normalizeSessionMeta(meta, badgeTitle) {
        const pl = Number(meta && meta.passLine);
        return {
            groupName: (meta && meta.groupName) || historyGroupName({ title: badgeTitle }),
            passLine: Number.isFinite(pl) && pl >= 1 && pl <= 100 ? Math.round(pl) : DEFAULT_PASS_LINE,
            passNote: (meta && meta.passNote) || ''
        };
    }

    function startTimer() {
        clearInterval(window.appState.timerInterval);
        window.appState.timerInterval = setInterval(() => {
            window.appState.elapsedSeconds++;
            const mins = String(Math.floor(window.appState.elapsedSeconds / 60)).padStart(2, '0');
            const secs = String(window.appState.elapsedSeconds % 60).padStart(2, '0');
            document.getElementById('timer-display').textContent = `${mins}:${secs}`;
            if (window.appState.elapsedSeconds % 5 === 0) saveActiveSession();
        }, 1000);
    }

    function renderQuestionDots() {
        const questions = window.appState.currentExamQuestions;
        const curIdx = window.appState.currentQuestionIndex;
        const answers = window.appState.selectedAnswers;
        const container = document.getElementById('question-dots');

        container.innerHTML = questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCurrent = idx === curIdx;
            let bgClass = "bg-slate-100 text-slate-500 border-slate-200";

            const revealed = window.appState.sessionMode === 'instant' && window.appState.revealed[idx];
            if (isCurrent) {
                bgClass = "bg-brand-600 text-white border-brand-700 ring-2 ring-brand-300 font-bold";
            } else if (revealed) {
                bgClass = userAns === q.correctIndex
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 font-bold"
                    : "bg-rose-100 text-rose-700 border-rose-300 font-bold";
            } else if (userAns !== undefined) {
                bgClass = "bg-brand-100 text-brand-700 border-brand-300 font-bold";
            }

            return `
                <button type="button" onclick="jumpToQuestion(${idx})" aria-label="問題${idx + 1}${revealed ? (userAns === q.correctIndex ? '（正解）' : '（不正解）') : userAns !== undefined ? '（解答済み）' : ''}" ${isCurrent ? 'aria-current="step"' : ''}
                    class="w-7 h-7 rounded-full text-xs border flex items-center justify-center transition-all ${bgClass}">
                    ${idx + 1}
                </button>
            `;
        }).join('');
    }

    window.jumpToQuestion = function(idx) {
        window.appState.currentQuestionIndex = idx;
        renderCurrentQuestion();
    };

    function renderCurrentQuestion() {
        const questions = window.appState.currentExamQuestions;
        const curIdx = window.appState.currentQuestionIndex;
        const q = questions[curIdx];
        const userAns = window.appState.selectedAnswers[curIdx];
        const isAnswered = userAns !== undefined;

        document.getElementById('current-q-num').textContent = curIdx + 1;
        const progressPercent = Math.round(((curIdx + 1) / questions.length) * 100);
        document.getElementById('exam-progress-bar').style.width = `${progressPercent}%`;

        renderQuestionDots();

        document.getElementById('btn-prev-q').disabled = curIdx === 0;
        const isLast = curIdx === questions.length - 1;
        const nextBtnText = document.getElementById('btn-next-text');

        if (isLast) {
            nextBtnText.textContent = '採点画面へ';
        } else {
            nextBtnText.textContent = '次の問題へ';
        }

        const container = document.getElementById('single-question-card');
        const labels = ['ア', 'イ', 'ウ', 'エ'];
        const instant = window.appState.sessionMode === 'instant';
        const revealed = instant && !!window.appState.revealed[curIdx];
        const isCorrect = isAnswered && userAns === q.correctIndex;

        let optionsHtml = q.options.map((opt, optIdx) => {
            const isSelected = optIdx === userAns;
            const isRightOption = optIdx === q.correctIndex;
            let btnStyle = "border-slate-200 hover:border-slate-300 bg-white text-slate-800";
            let badgeStyle = "border-slate-300 text-slate-500 bg-slate-50";
            let tag = '';

            if (revealed) {
                // 答え合わせ後：正解を緑、選んだ誤答を赤で示し、選び直しはできない
                if (isRightOption) {
                    btnStyle = "border-emerald-500 bg-emerald-50 font-bold text-emerald-900";
                    badgeStyle = "border-emerald-600 bg-emerald-600 text-white";
                    tag = '<span class="ml-auto text-xs font-bold text-emerald-700 shrink-0"><i class="fa-solid fa-circle-check mr-1"></i>正解</span>';
                } else if (isSelected) {
                    btnStyle = "border-rose-400 bg-rose-50 font-bold text-rose-900";
                    badgeStyle = "border-rose-600 bg-rose-600 text-white";
                    tag = '<span class="ml-auto text-xs font-bold text-rose-600 shrink-0"><i class="fa-solid fa-circle-xmark mr-1"></i>あなたの解答</span>';
                } else {
                    btnStyle = "border-slate-200 bg-white text-slate-500 opacity-70";
                }
            } else if (isSelected) {
                btnStyle = "border-brand-600 bg-brand-50/90 font-bold text-brand-900 ring-2 ring-brand-200";
                badgeStyle = "border-brand-600 bg-brand-600 text-white";
                tag = '<span class="ml-auto text-xs font-bold text-brand-600 shrink-0"><i class="fa-solid fa-check-circle mr-1"></i>選択中</span>';
            }

            return `
                <button type="button" onclick="handleOptionSelect(${curIdx}, ${optIdx})" ${revealed ? 'disabled' : ''} aria-pressed="${isSelected}"
                    class="w-full text-left p-4 rounded-2xl border-2 transition flex items-center space-x-3 disabled:cursor-default ${btnStyle}">
                    <span class="w-7 h-7 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${badgeStyle}">
                        ${labels[optIdx]}
                    </span>
                    <span class="text-xs sm:text-sm leading-snug flex-1">${escapeHtml(opt)}</span>
                    ${tag}
                </button>
            `;
        }).join('');

        let statusHtml;
        if (revealed) {
            statusHtml = isCorrect
                ? '<span class="text-xs font-bold text-emerald-600"><i class="fa-solid fa-circle-check mr-1"></i>正解</span>'
                : '<span class="text-xs font-bold text-rose-600"><i class="fa-solid fa-circle-xmark mr-1"></i>不正解</span>';
        } else {
            statusHtml = `<span class="text-xs font-bold ${isAnswered ? 'text-emerald-600' : 'text-slate-400'}">
                    ${isAnswered ? '<i class="fa-solid fa-check mr-1"></i>選択済み' : '選択肢をタップしてください'}
                </span>`;
        }

        const feedbackHtml = revealed ? `
            <div class="mt-6 p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}" role="status" aria-live="polite">
                <div class="font-black text-base ${isCorrect ? 'text-emerald-700' : 'text-rose-700'} mb-1">
                    ${isCorrect ? '○ 正解！' : '× 不正解'}
                </div>
                ${isCorrect ? '' : `<div class="text-xs text-slate-700 mb-2">正しい解答：<span class="font-bold text-emerald-700">${escapeHtml(labels[q.correctIndex] + '. ' + q.options[q.correctIndex])}</span></div>`}
                <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span class="font-bold text-brand-600">【解説】</span>${escapeHtml(q.explanation)}
                </div>
            </div>
        ` : '';

        let footerText, actionLabel, actionIcon;
        if (!instant) {
            footerText = isAnswered ? '選択肢を選び直すか、「解答を確定」ボタンを押してください' : '選択肢を選び「解答を確定」を押してください';
            actionLabel = isLast ? '解答を確定して採点結果へ' : '解答を確定して次の問題へ';
            actionIcon = isLast ? 'fa-award' : 'fa-arrow-right';
        } else if (!revealed) {
            footerText = '選択肢を選び「解答して答え合わせ」を押してください';
            actionLabel = '解答して答え合わせ';
            actionIcon = 'fa-check';
        } else {
            footerText = '解説を確認したら次へ進みましょう';
            actionLabel = isLast ? '採点結果へ' : '次の問題へ';
            actionIcon = isLast ? 'fa-award' : 'fa-arrow-right';
        }

        container.innerHTML = `
            <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <span class="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg">
                    ${escapeHtml(q.examName)}
                </span>
                <div class="flex items-center gap-2">
                    ${bookmarkButtonHtml(q.qid)}
                    ${statusHtml}
                </div>
            </div>

            <h2 class="text-base sm:text-lg font-bold text-slate-800 leading-relaxed mb-6">
                ${escapeHtml(q.title)}
            </h2>

            <div class="space-y-3">
                ${optionsHtml}
            </div>

            ${feedbackHtml}

            <div class="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span class="text-xs text-slate-500 font-medium">${footerText}</span>
                <button onclick="confirmAnswerAndNext()" ${!isAnswered ? 'disabled' : ''}
                    class="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2">
                    <span>${actionLabel}</span>
                    <i class="fa-solid ${actionIcon}"></i>
                </button>
            </div>
        `;
        saveActiveSession();
    }

    window.handleOptionSelect = function(qIndex, optIdx) {
        // 一問ずつモードで答え合わせ済みの問題は選び直せない
        if (window.appState.sessionMode === 'instant' && window.appState.revealed[qIndex]) return;
        window.appState.selectedAnswers[qIndex] = optIdx;
        renderCurrentQuestion();
    };

    window.confirmAnswerAndNext = function() {
        const curIdx = window.appState.currentQuestionIndex;
        const total = window.appState.currentExamQuestions.length;

        if (window.appState.selectedAnswers[curIdx] === undefined) {
            showModal("選択肢を選んでください", "解答する選択肢を1つ選んでから進んでください。");
            return;
        }

        // 一問ずつモード：1回目の押下では答え合わせだけ行い、次の押下で先へ進む
        if (window.appState.sessionMode === 'instant' && !window.appState.revealed[curIdx]) {
            window.appState.revealed[curIdx] = true;
            renderCurrentQuestion();
            return;
        }

        if (curIdx < total - 1) {
            window.appState.currentQuestionIndex++;
            renderCurrentQuestion();
        } else {
            finishExamSession();
        }
    };

    window.prevQuestion = function() {
        if (window.appState.currentQuestionIndex > 0) {
            window.appState.currentQuestionIndex--;
            renderCurrentQuestion();
        }
    };

    window.nextQuestion = function() {
        const total = window.appState.currentExamQuestions.length;
        if (window.appState.currentQuestionIndex < total - 1) {
            window.appState.currentQuestionIndex++;
            renderCurrentQuestion();
        } else {
            finishExamSession();
        }
    };

    window.confirmExitExam = function() {
        navigateTo('home');
    };

    async function finishExamSession() {
        const questions = window.appState.currentExamQuestions;
        const answers = window.appState.selectedAnswers;
        const answeredCount = Object.keys(answers).length;

        if (answeredCount < questions.length) {
            const ok = await appConfirm(`未解答の問題は不正解として採点されます。`, {
                title: `未解答が ${questions.length - answeredCount} 問あります`,
                okLabel: '採点する',
                cancelLabel: '問題に戻る'
            });
            if (!ok || !window.appState.examInProgress) return;
        }

        clearInterval(window.appState.timerInterval);
        window.appState.examInProgress = false;
        window.appState.hasResult = true;
        clearActiveSession();

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) {
                correctCount++;
            }
        });

        const total = questions.length;
        const accuracyVal = Math.round((correctCount / total) * 100);
        const mins = String(Math.floor(window.appState.elapsedSeconds / 60)).padStart(2, '0');
        const secs = String(window.appState.elapsedSeconds % 60).padStart(2, '0');
        const timeStr = `${mins}:${secs}`;

        const resultRecord = {
            title: document.getElementById('exam-badge').textContent,
            groupName: window.appState.sessionMeta.groupName,
            passLine: window.appState.sessionMeta.passLine,
            passed: accuracyVal >= window.appState.sessionMeta.passLine,
            score: `${correctCount} / ${total}`,
            accuracy: accuracyVal,
            timeSpent: timeStr,
            mode: window.appState.sessionMode,
            // 問題ごとの正誤（復習・苦手分析に使う）。Firestore は undefined を保存できないため null にそろえる
            answers: questions.filter(q => q.qid).map(q => {
                const idx = questions.indexOf(q);
                return {
                    qid: q.qid,
                    examId: q.examId || null,
                    examName: q.examName || '',
                    category: q.category || '',
                    answered: answers[idx] !== undefined,
                    correct: answers[idx] === q.correctIndex
                };
            }),
            createdAt: new Date().toISOString()
        };

        window.appState.lastWrongQuestions = questions.filter((q, idx) => answers[idx] !== q.correctIndex);
        const retryBtn = document.getElementById('btn-retry-wrong');
        document.getElementById('retry-wrong-count').textContent = window.appState.lastWrongQuestions.length;
        retryBtn.classList.toggle('hidden', window.appState.lastWrongQuestions.length === 0);

        // 保存（ローカル時も renderHistory まで行われ、履歴・統計がすぐ更新される）
        addRecord('history', resultRecord);

        document.getElementById('res-score').textContent = resultRecord.score;
        document.getElementById('res-accuracy').textContent = `${accuracyVal}%`;
        document.getElementById('res-time').textContent = timeStr;
        const { passLine, passNote } = window.appState.sessionMeta;
        const needed = Math.max(0, Math.ceil(passLine * total / 100) - correctCount);
        document.getElementById('res-status').textContent = accuracyVal >= passLine ? '合格ライン到達 🎉' : `あと${needed}問 📖`;
        document.getElementById('res-passline').textContent =
            `合格ライン（目安）: 正答率 ${passLine}% 以上` + (passNote ? `　※${passNote}` : '');
        document.getElementById('res-subtitle').textContent = `全${total}問の回答お疲れ様でした！すべての問題の正誤と解説を以下で確認できます。`;
        document.getElementById('res-list-title').textContent = `全${total}問の解答と解説一覧`;
        document.getElementById('res-list-chip').textContent = `全${total}問`;

        const expList = document.getElementById('explanations-list');
        expList.innerHTML = questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === q.correctIndex;
            const labels = ['ア', 'イ', 'ウ', 'エ'];

            return `
                <div class="p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-300' : 'bg-rose-50/50 border-rose-300'}">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-black text-xs ${isCorrect ? 'bg-emerald-600' : 'bg-rose-600'}">
                                ${isCorrect ? '○' : '×'}
                            </span>
                            <span class="text-xs font-bold px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                ${isCorrect ? '正解' : '不正解'}
                            </span>
                        </div>
                        <span class="flex items-center gap-2">
                            ${bookmarkButtonHtml(q.qid)}
                            <span class="text-xs font-bold text-slate-400">問題 ${idx + 1} / ${total}</span>
                        </span>
                    </div>

                    <span class="inline-block mb-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-bold text-slate-500">${escapeHtml(q.examName)}</span>
                    <h4 class="font-bold text-slate-800 text-sm sm:text-base mb-3 leading-snug">${escapeHtml(q.title)}</h4>

                    <div class="grid sm:grid-cols-2 gap-2 text-xs mb-4">
                        <div class="p-2.5 rounded-xl border ${isCorrect ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'}">
                            <span class="text-slate-400 block font-medium mb-0.5">あなたの回答</span>
                            <span class="font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}">
                                ${userAns !== undefined ? escapeHtml(labels[userAns] + '. ' + q.options[userAns]) : '未回答'}
                            </span>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-emerald-200">
                            <span class="text-slate-400 block font-medium mb-0.5">正しい解答</span>
                            <span class="font-bold text-emerald-700">
                                ${escapeHtml(labels[q.correctIndex] + '. ' + q.options[q.correctIndex])}
                            </span>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        <span class="font-bold text-brand-600 block mb-1">【詳しい解説】</span>
                        ${escapeHtml(q.explanation)}
                    </div>
                </div>
            `;
        }).join('');

        navigateTo('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 履歴を検定ごとにまとめる名前（古い記録は表示名から推定する）
    function historyGroupName(item) {
        if (item.groupName) return item.groupName;
        return String(item.title || '演習')
            .replace(/\s*\((全)?\d+問\)$/, '')
            .replace(/\s*ミックス\d+問演習$/, ' ミックス')
            .replace(/ミックス\d+問総合テスト$/, 'ミックス')
            .replace(/^令和\d+年度\s*/, '')
            .trim() || '演習';
    }

    function historyAccuracy(item) {
        return typeof item.accuracy === 'number' ? item.accuracy : (parseInt(item.accuracy, 10) || 0);
    }

    function historyPassed(item) {
        return historyAccuracy(item) >= (item.passLine || DEFAULT_PASS_LINE);
    }

    function getFilteredHistory() {
        const f = window.appState.historyFilter;
        return f === 'ALL' ? window.appState.history : window.appState.history.filter(h => historyGroupName(h) === f);
    }

    function formatDateTime(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    window.setHistoryFilter = function(value) {
        window.appState.historyFilter = value || 'ALL';
        renderHistory();
    };

    window.deleteHistoryRecord = async function(id) {
        const item = window.appState.history.find(h => h.id === id);
        if (!item) return;
        if (!(await appConfirm(`${formatDateTime(item.createdAt)} の「${item.title}」\n問題ごとの正誤（復習・苦手分析）からも除かれます。`, { title: 'この記録を削除しますか？', okLabel: '削除する', danger: true }))) return;
        removeRecords('history', [id]);
    };

    function renderHistoryFilter() {
        const select = document.getElementById('history-filter');
        const counts = new Map();
        window.appState.history.forEach(h => {
            const g = historyGroupName(h);
            counts.set(g, (counts.get(g) || 0) + 1);
        });
        if (window.appState.historyFilter !== 'ALL' && !counts.has(window.appState.historyFilter)) {
            window.appState.historyFilter = 'ALL';
        }
        const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'));
        select.innerHTML = `<option value="ALL">すべての演習（${window.appState.history.length}回）</option>` +
            groups.map(([g, n]) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}（${n}回）</option>`).join('');
        select.value = window.appState.historyFilter;
    }

    function renderHistory() {
        const tbody = document.getElementById('history-table-body');
        // 保存先にかかわらず新しい順に並べる（グラフ・表ともこの順序を前提にする）
        window.appState.history = sortHistory(window.appState.history);
        renderLearningInsights();
        renderHistoryFilter();
        const history = getFilteredHistory();

        document.getElementById('stat-total-count').textContent = `${history.length} 回`;
        document.getElementById('stat-pass-count').textContent = `${history.filter(historyPassed).length} 回`;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">履歴データがまだありません。演習を実施してください。</td></tr>`;
            document.getElementById('stat-avg-score').textContent = '0 %';
        } else {
            const avgAcc = Math.round(history.reduce((sum, h) => sum + historyAccuracy(h), 0) / history.length);
            document.getElementById('stat-avg-score').textContent = `${avgAcc} %`;

            tbody.innerHTML = history.map(item => {
                const accVal = historyAccuracy(item);
                return `
                <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">${escapeHtml(formatDateTime(item.createdAt))}</td>
                    <td class="py-3.5 px-6 font-semibold text-slate-700 text-xs">${escapeHtml(item.title)}</td>
                    <td class="py-3.5 px-6 text-center text-xs font-bold text-slate-800 whitespace-nowrap">${escapeHtml(item.score)}</td>
                    <td class="py-3.5 px-6 text-center">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${historyPassed(item) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}"
                            title="合格ライン ${escapeHtml(item.passLine || DEFAULT_PASS_LINE)}%">
                            ${escapeHtml(accVal)}%
                        </span>
                    </td>
                    <td class="py-3.5 px-6 text-right text-xs text-slate-500">${escapeHtml(item.timeSpent || '-')}</td>
                    <td class="py-3.5 px-4 text-right">
                        <button type="button" data-history-id="${escapeHtml(item.id)}" onclick="deleteHistoryRecord(this.dataset.historyId)"
                            class="text-slate-300 hover:text-rose-500 p-1 transition" aria-label="この記録を削除" title="この記録を削除">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                </tr>
            `}).join('');
        }

        if (!document.getElementById('view-history').classList.contains('hidden')) {
            renderHistoryChart();
        }
    }

    // --- 成績グラフ描画 & 履歴クリア ---
    function renderHistoryChart() {
        const ctx = document.getElementById('history-chart');
        if (!ctx) return;

        const recent = getFilteredHistory().slice(0, 10).reverse();

        const labels = recent.map(item => {
            const d = new Date(item.createdAt);
            return Number.isNaN(d.getTime()) ? '-' : `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const data = recent.map(historyAccuracy);
        // 検定で絞り込んでいて合格ラインがそろっていれば、合格ラインを点線で重ねる
        const passLines = [...new Set(recent.map(item => item.passLine || DEFAULT_PASS_LINE))];
        const showPassLine = window.appState.historyFilter !== 'ALL' && recent.length > 0 && passLines.length === 1;

        if (historyChartInstance) {
            historyChartInstance.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        if (window.Chart && Chart.defaults) {
            Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
            Chart.defaults.borderColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.1)';
        }

        historyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['データなし'],
                datasets: [{
                    label: '正答率 (%)',
                    data: data.length > 0 ? data : [0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#2563eb',
                    pointRadius: 5
                }].concat(showPassLine ? [{
                    label: `合格ライン (${passLines[0]}%)`,
                    data: recent.map(() => passLines[0]),
                    borderColor: '#10b981',
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }] : [])
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                },
                plugins: {
                    legend: { display: showPassLine }
                }
            }
        });
    }

    window.clearHistoryData = async function() {
        if (!(await appConfirm('すべての受検履歴と、問題ごとの正誤（復習・苦手分析）が削除されます。この操作は取り消せません。', { title: '履歴をすべて削除しますか？', okLabel: 'すべて削除', danger: true }))) return;

        removeRecords('history', window.appState.history.map(h => h.id));

        showModal("履歴クリア", "受検履歴を初期化しました。");
    };

    // --- お問い合わせ送信処理 ---
    // Firestore の artifacts/{appId}/contacts に保存する（読み取りは運営者のみ。firestore.rules 参照）
    const CONTACT_CATEGORIES = ['不具合・バグ報告', '問題の誤記指摘', '検定リクエスト', 'その他'];
    const CONTACT_LIMITS = { name: 100, email: 254, message: 2000 };
    const CONTACT_SEND_TIMEOUT_MS = 10000;
    let contactSending = false;

    window.handleSendSupportContact = async function(e) {
        e.preventDefault();
        if (contactSending) return;

        const form = e.target;
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const category = document.getElementById('contact-category').value;
        const message = document.getElementById('contact-message').value.trim();

        if (!message) {
            showModal("入力エラー", "メッセージ内容を入力してください。");
            return;
        }
        if (name.length > CONTACT_LIMITS.name || email.length > CONTACT_LIMITS.email || message.length > CONTACT_LIMITS.message) {
            showModal("入力エラー", `文字数が上限を超えています（メッセージは${CONTACT_LIMITS.message}文字まで）。`);
            return;
        }
        if (!CONTACT_CATEGORIES.includes(category)) {
            showModal("入力エラー", "お問い合わせ種別を選択してください。");
            return;
        }

        // サーバーに届かない状態では「送信完了」と表示しない
        if (!fb || !currentUser) {
            showModal("送信できませんでした", "現在サーバーに接続できないため、お問い合わせを送信できません。入力内容はそのまま残していますので、時間をおいて再度お試しください。");
            return;
        }

        const submitBtn = document.getElementById('contact-submit');
        const originalBtnHtml = submitBtn.innerHTML;
        contactSending = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>送信中…</span>';

        try {
            const contactsCol = fb.collection(db, 'artifacts', appId, 'contacts');
            await withTimeout(fb.addDoc(contactsCol, {
                name,
                email,
                category,
                message,
                uid: currentUser.uid,
                createdAt: fb.serverTimestamp()
            }), CONTACT_SEND_TIMEOUT_MS);
            form.reset();
            showModal("送信完了", "お問い合わせ・ご意見を受け付けました。貴重なご意見ありがとうございます！");
        } catch (err) {
            console.error("お問い合わせの送信に失敗しました:", err);
            if (String(err && err.message).startsWith('timeout')) {
                showModal("送信を確認できませんでした", "サーバーからの応答がありません。通信が不安定な可能性があります。通信が回復すると自動で送信されることがあるため、少し時間をおいてから再送信してください。");
            } else {
                showModal("送信できませんでした", "お問い合わせの送信に失敗しました。入力内容はそのまま残していますので、時間をおいて再度お試しください。");
            }
        } finally {
            contactSending = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    };

    // ===== ダイアログ（フォーカスの閉じ込め・復帰つき） =====
    const dialogStack = [];

    function dialogFocusables(el) {
        return [...el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter(n => !n.disabled && n.getClientRects().length > 0);
    }

    function openDialog(el, focusEl) {
        if (!dialogStack.some(d => d.el === el)) {
            dialogStack.push({ el, returnFocus: document.activeElement });
        }
        el.classList.remove('hidden');
        const target = focusEl || dialogFocusables(el)[0];
        if (target) target.focus();
    }

    function closeDialog(el) {
        el.classList.add('hidden');
        const i = dialogStack.findIndex(d => d.el === el);
        if (i < 0) return;
        const [d] = dialogStack.splice(i, 1);
        if (d.returnFocus && document.contains(d.returnFocus) && typeof d.returnFocus.focus === 'function') {
            d.returnFocus.focus();
        }
    }

    function topDialog() {
        return dialogStack.length > 0 ? dialogStack[dialogStack.length - 1].el : null;
    }

    // Tab キーでダイアログの外へフォーカスが出ないようにする
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const el = topDialog();
        if (!el) return;
        const items = dialogFocusables(el);
        if (items.length === 0) { e.preventDefault(); return; }
        const first = items[0], last = items[items.length - 1];
        if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    let modalResolver = null;
    const MODAL_ICONS = {
        info: ['bg-brand-100 text-brand-600', 'fa-info'],
        question: ['bg-amber-100 text-amber-600', 'fa-question'],
        danger: ['bg-rose-100 text-rose-600', 'fa-triangle-exclamation']
    };

    function openAppModal({ title, message, okLabel = '確認', cancelLabel = null, danger = false, icon = 'info' }) {
        if (modalResolver) { const r = modalResolver; modalResolver = null; r(false); }
        const el = document.getElementById('app-modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        const [iconBox, iconName] = MODAL_ICONS[danger ? 'danger' : icon] || MODAL_ICONS.info;
        const iconEl = document.getElementById('modal-icon');
        iconEl.className = `w-12 h-12 rounded-full ${iconBox} flex items-center justify-center text-xl mx-auto mb-3`;
        iconEl.innerHTML = `<i class="fa-solid ${iconName}"></i>`;
        const okBtn = document.getElementById('modal-ok');
        const cancelBtn = document.getElementById('modal-cancel');
        okBtn.textContent = okLabel;
        okBtn.className = `flex-1 py-2.5 ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'} text-white font-bold rounded-xl text-sm`;
        cancelBtn.textContent = cancelLabel || 'キャンセル';
        cancelBtn.classList.toggle('hidden', !cancelLabel);
        return new Promise(resolve => {
            modalResolver = resolve;
            // 取り消せない操作の確認では、誤操作を防ぐため「キャンセル」に初期フォーカス
            openDialog(el, cancelLabel && danger ? cancelBtn : okBtn);
        });
    }

    function showModal(title, msg) {
        return openAppModal({ title, message: msg });
    }

    // confirm() の代わり。OK なら true、キャンセル・Esc・背景クリックなら false
    function appConfirm(message, { title = '確認', okLabel = 'OK', cancelLabel = 'キャンセル', danger = false } = {}) {
        return openAppModal({ title, message, okLabel, cancelLabel, danger, icon: 'question' });
    }

    window.closeModal = function(result = false) {
        const el = document.getElementById('app-modal');
        if (el.classList.contains('hidden')) return;
        closeDialog(el);
        const r = modalResolver;
        modalResolver = null;
        if (r) r(!!result);
    };

    // ===== 表示テーマ（システム設定 / ライト / ダーク） =====
    const THEME_KEY = 'quailq:theme';
    const THEME_LABELS = {
        system: ['fa-circle-half-stroke', '表示テーマ: システム設定に合わせる'],
        light: ['fa-sun', '表示テーマ: ライト'],
        dark: ['fa-moon', '表示テーマ: ダーク']
    };
    const darkMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function getThemePref() {
        try { const v = localStorage.getItem(THEME_KEY); return THEME_LABELS[v] ? v : 'system'; } catch (_) { return 'system'; }
    }

    function applyTheme() {
        const pref = getThemePref();
        const dark = pref === 'dark' || (pref === 'system' && !!darkMedia && darkMedia.matches);
        document.documentElement.classList.toggle('dark', dark);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const [icon, label] = THEME_LABELS[pref];
            btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            btn.setAttribute('aria-label', `${label}（クリックで切り替え）`);
            btn.title = label;
        }
        if (currentView === 'history') renderHistoryChart();
    }

    window.cycleTheme = function() {
        const order = ['system', 'light', 'dark'];
        const next = order[(order.indexOf(getThemePref()) + 1) % order.length];
        try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
        applyTheme();
    };

    if (darkMedia && darkMedia.addEventListener) {
        darkMedia.addEventListener('change', () => { if (getThemePref() === 'system') applyTheme(); });
    }

    // HTML に埋め込む値は必ずこれを通す（文字列以外も安全に扱う）
    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
})();

// QualiQ 収録検定データ
// 問題の追加・修正はこのファイルで行う。
// ※ 問題 ID は「検定ID-番号」で並び順から決まり、学習記録はこの ID に結び付く。
//    問題を追加するときは各セットの末尾に追加すること。
(function () {
    'use strict';

    // --- 各検定 20問全問個別データベース ---
    const ITPASS_QUESTIONS = [
        { title: "【ITパスポート 問1】AI分野における「LLM（大規模言語モデル）」の説明として最も適切なものはどれか。", options: ["画像認識専用のディープラーニングモデル", "大量のテキストデータを事前学習した高度な自然言語処理AIモデル", "暗号キーを生成するプログラム", "通信遅延を計測するプロトコル"], correctIndex: 1, explanation: "LLM (Large Language Model) は大量のテキストから言葉の並びや意味を学習し、自然な文章生成や質疑応答を行うAIモデルです。" },
        { title: "【ITパスポート 問2】実在する企業を装った電子メールから偽Webサイトへ誘導し、情報を盗み取る攻撃はどれか。", options: ["フィッシング詐欺", "DDoS攻撃", "SQLインジェクション", "ブルートフォース攻撃"], correctIndex: 0, explanation: "偽のメールやWebサイトでログイン情報やクレジットカード番号を搾取する攻撃をフィッシング詐欺と呼びます。" },
        { title: "【ITパスポート 問3】情報セキュリティの3大要素（CIA）に含まれないものはどれか。", options: ["機密性 (Confidentiality)", "完全性 (Integrity)", "可用性 (Availability)", "即時性 (Immediacy)"], correctIndex: 3, explanation: "セキュリティの3大要素は「機密性」「完全性」「可用性」です。" },
        { title: "【ITパスポート 問4】クラウドサービスにおいて、ハードウェアやネットワークインフラのみを提供する形態はどれか。", options: ["SaaS", "PaaS", "IaaS", "DaaS"], correctIndex: 2, explanation: "IaaS (Infrastructure as a Service) は、仮想サーバーやネットワークなどのインフラ基盤を提供するサービス形態です。" },
        { title: "【ITパスポート 問5】アジャイル開発に関する記述として適切なものはどれか。", options: ["開発工程を順番に1つずつ完了させて進める", "仕様変更に対応せず最初にすべての要件を固める", "短いサイクルで開発とリリースを繰り返し柔軟に対応する", "テスト工程を省略して構築する手法"], correctIndex: 2, explanation: "アジャイル開発は、小規模な実装とテストのサイクル（イテレーション）を繰り返す柔軟な開発手法です。" },
        { title: "【ITパスポート 問6】著作権法によって保護される対象として適切なものはどれか。", options: ["プログラミング言語の規約", "プログラムのソースコード", "アルゴリズム（解法の手順）", "通信プロトコル"], correctIndex: 1, explanation: "著作権法ではプログラムのソースコード（表現）が保護対象となります。言語規約やアルゴリズム自体は対象外です。" },
        { title: "【ITパスポート 問7】関係データベース（RDB）でデータを検索・操作するための標準的な言語はどれか。", options: ["HTML", "SQL", "Python", "JSON"], correctIndex: 1, explanation: "RDBのデータの定義・操作にはSQL (Structured Query Language) が広く使用されます。" },
        { title: "【ITパスポート 問8】企業等の組織で、個人所有のIT端末を業務に利用する形態を表す言葉はどれか。", options: ["BYOD", "BPR", "BCP", "KPI"], correctIndex: 0, explanation: "BYOD (Bring Your Own Device) は従業員私物のスマートフォンやPCを業務で利用することです。" },
        { title: "【ITパスポート 問9】IPv4アドレスのビット数はいくつか。", options: ["16ビット", "32ビット", "64ビット", "128ビット"], correctIndex: 1, explanation: "IPv4アドレスは32ビット（4バイト）、IPv6アドレスは128ビットで構成されています。" },
        { title: "【ITパスポート 問10】企業の財務視点だけでなく「顧客」「社内ビジネスプロセス」「学習と成長」の4視点で評価する手法はどれか。", options: ["SWOT分析", "BSC (バランススコアカード)", "Porters 5 Forces", "3C分析"], correctIndex: 1, explanation: "BSC (Balanced Scorecard) は4つの視点から組織のパフォーマンスをバランスよく評価・管理する枠組みです。" },
        { title: "【ITパスポート 問11】ランサムウェアの特徴として適切なものはどれか。", options: ["PC内のファイルを暗号化し、復元と引き換えに金銭を要求する", "キーボードの入力履歴を記録して外部送信する", "大量のパケットを送ってサーバーを過負荷にする", "ネットワーク上の通信を盗聴する"], correctIndex: 0, explanation: "ランサムウェア（身代金型悪意あるプログラム）はデータを暗号化等で使えなくし、解除費用を請求します。" },
        { title: "【ITパスポート 問12】Webサイトの訪問者の端末に一時的にデータを保存し、ログイン状態などを保持する仕組みはどれか。", options: ["Cookie", "キャッシュ", "DNS", "プロキシ"], correctIndex: 0, explanation: "Cookie（クッキー）はブラウザに保存される識別用データで、ログイン情報の維持等に利用されます。" },
        { title: "【ITパスポート 問13】プロジェクト管理において、全工程の遅延に直結する最も長い経路を何と呼ぶか。", options: ["アローパス", "クリティカルパス", "マイルストーン", "ガントチャート"], correctIndex: 1, explanation: "クリティカルパス上の作業が遅れると、プロジェクト全体の完了日数がそのまま遅延します。" },
        { title: "【ITパスポート 問14】情報漏洩対策として、電子メール送受信時に受信者の指定以外へ非表示で送信する機能はどれか。", options: ["To", "Cc", "Bcc", "Forward"], correctIndex: 2, explanation: "Bcc (Blind Carbon Copy) に設定したアドレスは、他の受信用アドレスから見えない状態になります。" },
        { title: "【ITパスポート 問15】システム障害に備え、同一構成の別システムを用意して常時同期させておく運用を何と呼ぶか。", options: ["デュプレックスシステム", "デュアルシステム", "クラスタリング", "バックアップ"], correctIndex: 1, explanation: "デュアルシステムは2基のシステムで同じ処理を行い、結果を照合しながら稼働する信頼性の高い運用形態です。" },
        { title: "【ITパスポート 問16】情報セキュリティにおける「ゼロトラスト」の基本的な考え方はどれか。", options: ["社内ネットワーク内部は安全であると信頼する", "すべてのアクセスを信頼せず毎回認証・検証を行う", "パスワードのみで完全に安全性を保つ", "セキュリティソフトの導入だけで対策を完結させる"], correctIndex: 1, explanation: "ゼロトラストは「決して信頼せず、常に検証する」というセキュリティ概念です。" },
        { title: "【ITパスポート 問17】システム開発の要件定義プロセスで行う作業として最も適切なものはどれか。", options: ["プログラミング言語でのコーディング", "ユーザーがシステムに求める機能や性能を明確にする", "サーバー機器のラックマウント設置", "単体テストの実行"], correctIndex: 1, explanation: "要件定義は、業務上のニーズや必要な機能・性能・制約事項を特定して明確にする工程です。" },
        { title: "【ITパスポート 問18】企業が事業継続を図るため、災害時の復旧手順などをまとめた計画はどれか。", options: ["BCP (事業継続計画)", "BPR (業務再構築)", "CSR (社会的責任)", "M&A (企業買収)"], correctIndex: 0, explanation: "BCP (Business Continuity Plan) は、緊急事態において事業を中断させない、または早期復旧させる計画です。" },
        { title: "【ITパスポート 問19】公開鍵暗号方式における鍵の扱いに関する記述として適切なものはどれか。", options: ["暗号化と復号に同じ共通鍵を使用する", "暗号化鍵は公開し、復号鍵は受領者が秘密に保持する", "送信者が秘密鍵で暗号化し、受信者は鍵を使わず復号する", "暗号化鍵も復号鍵も全員に公開する"], correctIndex: 1, explanation: "公開鍵暗号方式では、誰でも使える公開鍵で暗号化し、対となる秘密鍵（受信者のみ所持）で復号します。" },
        { title: "【ITパスポート 問20】ソーシャルエンジニアリングに該当する行いはどれか。", options: ["サーバーへの大量アクセス攻撃", "管理者の肩越しにパスワード入力画面を盗み見る", "SQL文を悪用してDBを改ざんする", "無線LANの暗号化キーを解読する"], correctIndex: 1, explanation: "人間の心理的隙や物理的な行動（盗み見、ゴミ箱の漁り等）を利用してパスワードなどを得る手法です。" }
    ];

    // ===== 実用英語技能検定（級別） =====
    // 各級の出題範囲（語彙・文法・会話）を参考にしたオリジナル問題（級の割り当ては目安）
    const EIKEN4_QUESTIONS = buildSet('英検4級', [
        ["My sister (    ) tennis every Sunday.", ["plays", "play", "playing", "to play"], "主語が3人称単数（My sister）で現在の習慣を表すので、動詞に -s を付けて plays にします。"],
        ["A: (    ) you help me with my homework?  B: Sure.", ["Can", "Are", "Is", "Have"], "「〜してくれますか」と依頼するときは Can you 〜? を使います。"],
        ["I was (    ) a bath when you called me.", ["taking", "take", "took", "takes"], "過去のある時点に「〜していた」は過去進行形（was + -ing）です。"],
        ["This bag is (    ) than that one.", ["bigger", "big", "biggest", "more big"], "than があるので比較級にします。big の比較級は g を重ねて bigger です。"],
        ["Tom went to the library (    ) some books.", ["to borrow", "borrow", "borrowed", "borrows"], "「〜するために」と目的を表すのは to 不定詞（to + 動詞の原形）です。"],
        ["A: Whose umbrella is this?  B: It's (    ).", ["mine", "my", "me", "I"], "「私のもの」は所有代名詞 mine です。"],
        ["We (    ) to Kyoto last summer.", ["went", "go", "goes", "going"], "last summer（去年の夏）とあるので過去形 went にします。"],
        ["There (    ) many students in the gym.", ["are", "is", "be", "was"], "many students（複数）なので There are 〜 を使います。"],
        ["A: How (    ) does it take to get to the station?  B: About ten minutes.", ["long", "many", "much", "old"], "かかる時間をたずねるときは How long does it take 〜? を使います。"],
        ["My father is good at (    ).", ["cooking", "cook", "cooks", "to cooking"], "前置詞 at の後ろには動名詞（-ing）を置きます。be good at 〜ing で「〜するのが得意だ」。"],
        ["Please be quiet. The baby is (    ).", ["sleeping", "sleep", "slept", "sleeps"], "「今〜している」は現在進行形（be + -ing）です。"],
        ["I have to (    ) up early tomorrow.", ["get", "gets", "got", "getting"], "have to の後ろは動詞の原形です。"],
        ["Ken is the (    ) runner in his class.", ["fastest", "faster", "fast", "most fast"], "the と in his class（クラスの中で）があるので最上級 fastest にします。"],
        ["A: (    ) is your birthday?  B: It's May 5th.", ["When", "Where", "Who", "Which"], "日付をたずねているので When を使います。"],
        ["She will (    ) her grandmother next week.", ["visit", "visits", "visited", "visiting"], "助動詞 will の後ろは動詞の原形です。"],
        ["A (    ) is a place where you can borrow books.", ["library", "hospital", "station", "bakery"], "本を借りられる場所は library（図書館）です。"],
        ["My brother can speak English very (    ).", ["well", "good", "kind", "much"], "動詞 speak を説明するのは副詞 well（上手に）です。good は形容詞です。"],
        ["A: Shall we go shopping?  B: (    )", ["Yes, let's.", "No, I'm not.", "Yes, I do.", "It's mine."], "Shall we 〜?（〜しましょうか）への返事は Yes, let's. / No, let's not. です。"],
        ["I'm hungry. I didn't eat (    ) this morning.", ["anything", "something", "nothing", "many"], "否定文で「何も〜ない」は not 〜 anything を使います。"],
        ["The museum (    ) at nine every morning.", ["opens", "open", "opening", "to open"], "主語 The museum は3人称単数で、毎朝の決まった事柄なので現在形 opens です。"]
    ]);

    const EIKEN3_QUESTIONS = buildSet('英検3級', [
        ["This song is loved (    ) many young people.", ["by", "with", "for", "from"], "受け身（be + 過去分詞）で「〜によって」と行為者を示すのは by です。"],
        ["I have (    ) been to Hokkaido.", ["never", "ever", "yet", "still"], "現在完了の経験用法で「一度も〜したことがない」は have never been to 〜 です。"],
        ["Do you know (    ) he lives?", ["where", "what", "which", "who"], "「彼がどこに住んでいるか」なので間接疑問 where he lives にします。"],
        ["I have lived here (    ) 2015.", ["since", "for", "from", "during"], "現在完了の継続用法で「〜以来」と起点を示すのは since です。"],
        ["The man (    ) is standing over there is my uncle.", ["who", "which", "whose", "what"], "先行詞が人（The man）で、後ろに動詞が続くので主格の関係代名詞 who を使います。"],
        ["It is important (    ) us to protect the environment.", ["for", "of", "to", "with"], "It is 〜 for 人 to … で「人が…することは〜だ」です。"],
        ["My mother told me (    ) my room.", ["to clean", "clean", "cleaning", "cleaned"], "tell 人 to 〜 で「人に〜するように言う」です。"],
        ["I'm looking forward (    ) you again.", ["to seeing", "to see", "seeing", "see"], "look forward to 〜ing（〜するのを楽しみに待つ）の to は前置詞なので、後ろは動名詞です。"],
        ["This is the book (    ) I bought yesterday.", ["that", "who", "whose", "what"], "先行詞が物（the book）で、目的格の関係代名詞として that（または which）を使います。"],
        ["She has a cat (    ) Tama.", ["named", "naming", "names", "to name"], "「タマと名付けられた猫」なので過去分詞 named が後ろから名詞を説明します。"],
        ["If it (    ) tomorrow, we will stay home.", ["rains", "will rain", "rained", "raining"], "条件を表す if の文では、未来のことでも現在形を使います。"],
        ["I don't know what (    ).", ["to do", "doing", "do", "did"], "what to do で「何をすべきか」です。"],
        ["Have you finished your homework (    )?", ["yet", "ago", "since", "never"], "現在完了の疑問文で「もう〜しましたか」は yet を文末に置きます。"],
        ["The letter was (    ) in English.", ["written", "wrote", "write", "writing"], "受け身（be + 過去分詞）なので write の過去分詞 written です。"],
        ["He is too tired (    ) walk any more.", ["to", "for", "that", "so"], "too 〜 to … で「あまりに〜なので…できない」です。"],
        ["A: Would you like some more tea?  B: (    )", ["No, thank you. I've had enough.", "Yes, I'm tea.", "You're welcome.", "Here you are."], "おかわりを勧められて断るときの自然な返事は No, thank you. です。"],
        ["We need to (    ) the meeting because the teacher is sick.", ["cancel", "invite", "borrow", "wear"], "先生が病気なので会議を「中止する」cancel が適切です。"],
        ["Look at the boy (    ) soccer in the park.", ["playing", "plays", "played", "to play"], "「サッカーをしている少年」なので現在分詞 playing が後ろから名詞を説明します。"],
        ["My father is (    ) busy that he can't take a vacation.", ["so", "too", "very", "such"], "so 〜 that … で「とても〜なので…」です。"],
        ["A: How about going to the movies?  B: That (    ) great.", ["sounds", "listens", "hears", "speaks"], "相手の提案に「それはいいね」と答えるときは That sounds great. です。"]
    ]);

    const EIKEN_P2_QUESTIONS = buildSet('英検準2級', [
        ["The bridge (    ) 100 years ago is still used today.", ["built", "building", "builds", "to build"], "「100年前に建てられた橋」なので過去分詞 built が後ろから名詞を説明します。"],
        ["I wish I (    ) more time to study.", ["had", "have", "will have", "having"], "I wish の後ろで現在の事実に反する願望を言うときは過去形（仮定法過去）を使います。"],
        ["She suggested (    ) to the park.", ["going", "to go", "go", "gone"], "suggest は動名詞を目的語にとります（suggest 〜ing）。"],
        ["He apologized (    ) being late.", ["for", "to", "of", "with"], "apologize for 〜 で「〜のことで謝る」です（謝る相手には to を使います）。"],
        ["By the time we arrived, the train (    ).", ["had left", "has left", "leaves", "will leave"], "過去のある時点（到着した時）よりも前に完了していたことは過去完了（had + 過去分詞）です。"],
        ["The teacher made us (    ) the essay again.", ["write", "to write", "writing", "written"], "使役動詞 make は make 人 + 動詞の原形 の形をとります。"],
        ["This is the town (    ) I was born.", ["where", "which", "what", "who"], "後ろが完全な文（I was born）で場所を表すので関係副詞 where を使います。"],
        ["I'm all wet. I (    ) have brought an umbrella.", ["should", "can", "may", "will"], "should have + 過去分詞で「〜すべきだった（のにしなかった）」という後悔を表します。"],
        ["The company decided to (    ) more workers because business was growing.", ["hire", "fire", "retire", "refuse"], "業績が伸びているので従業員を「雇う」hire が適切です。"],
        ["It was (    ) a hot day that we went swimming.", ["such", "so", "very", "too"], "such a + 形容詞 + 名詞 + that … で「とても〜な…なので」です。名詞が続くので so ではなく such です。"],
        ["Not only Ken but also his friends (    ) interested in the project.", ["are", "is", "was", "has"], "not only A but also B が主語のときは、動詞を B（his friends：複数）に合わせます。"],
        ["He spoke slowly (    ) everyone could understand him.", ["so that", "even if", "as if", "unless"], "so that 〜 can/could … で「〜が…できるように」と目的を表します。"],
        ["The number of tourists (    ) increasing every year.", ["is", "are", "have", "were"], "the number of 〜（〜の数）は単数扱いです。a number of 〜（たくさんの〜）は複数扱いなので区別しましょう。"],
        ["I'm used to (    ) up early.", ["getting", "get", "got", "be getting"], "be used to 〜ing で「〜することに慣れている」。この to は前置詞です。"],
        ["Please (    ) this form and give it to the receptionist.", ["fill out", "take off", "give up", "look after"], "書類に「記入する」は fill out（fill in）です。"],
        ["My grandmother (    ) after my little brother while my parents are at work.", ["looks", "takes", "gets", "makes"], "look after 〜 で「〜の世話をする」です。"],
        ["She was (    ) to see her old friend at the station.", ["surprised", "surprising", "surprise", "surprisingly"], "人が「驚いた」は surprised。surprising は「（物事が）驚くべき」です。"],
        ["Each of the students (    ) a computer.", ["has", "have", "having", "to have"], "each of 〜 は単数扱いなので has を使います。"],
        ["A: I'm sorry I broke your cup.  B: (    )", ["Don't worry about it.", "You're welcome.", "Me too.", "Here you are."], "謝罪に対して「気にしないで」と答えるのが自然です。You're welcome. はお礼への返事です。"],
        ["I'd rather (    ) at home tonight.", ["stay", "staying", "to stay", "stayed"], "would rather + 動詞の原形 で「むしろ〜したい」です。"]
    ]);

    const EIKEN_P2PLUS_QUESTIONS = buildSet('英検準2級プラス', [
        ["The concert was (    ) because of heavy rain.", ["canceled", "cancel", "canceling", "cancels"], "コンサートは「中止された」ので受け身（be + 過去分詞）の canceled にします。"],
        ["I'm thinking (    ) studying abroad next year.", ["about", "to", "with", "at"], "think about 〜ing で「〜することを考えている」です（think of 〜ing も同じ意味）。"],
        ["If I (    ) you, I would accept the offer.", ["were", "am", "will be", "have been"], "現在の事実に反する仮定は仮定法過去。be 動詞は主語にかかわらず were を使うのが基本です。"],
        ["She has been studying English (    ) she was ten.", ["since", "for", "during", "while"], "「10歳のときから（ずっと）」と起点を表すので since を使います。"],
        ["The museum (    ) we visited last week was very interesting.", ["that", "where", "what", "whose"], "visit は目的語をとる動詞なので、目的格の関係代名詞 that（which）を使います。where は使えません。"],
        ["Could you tell me how (    ) to the city hall?", ["to get", "getting", "get", "got"], "how to 〜 で「〜の仕方」。how to get to 〜 は道をたずねる定番表現です。"],
        ["It took me three hours (    ) the report.", ["to finish", "finishing", "finish", "finished"], "It takes 人 時間 to 〜 で「人が〜するのに（時間が）かかる」です。"],
        ["The new smartphone is very (    ); many people want to buy it.", ["popular", "private", "polite", "patient"], "多くの人が買いたがっているので「人気がある」popular が適切です。"],
        ["We should (    ) energy by turning off lights we are not using.", ["save", "spend", "waste", "borrow"], "使っていない電気を消してエネルギーを「節約する」save が適切です。"],
        ["My parents let me (    ) to the concert alone.", ["go", "to go", "going", "went"], "使役動詞 let は let 人 + 動詞の原形 の形で「人に〜させてあげる」です。"],
        ["This is the most exciting movie I have (    ) seen.", ["ever", "never", "yet", "already"], "最上級 + I have ever 〜 で「今まで〜した中で最も…」です。"],
        ["He walked into the room without (    ) a word.", ["saying", "say", "to say", "said"], "前置詞 without の後ろは動名詞です。without 〜ing で「〜せずに」。"],
        ["A: Do you mind if I open the window?  B: (    )", ["Not at all. Go ahead.", "You're welcome.", "Here you are.", "Me neither."], "Do you mind if 〜? は「〜してもかまいませんか」。かまわないときは Not at all.（全くかまいません）と答えます。"],
        ["Please (    ) care of yourself.", ["take", "make", "have", "give"], "take care of 〜 で「〜を大事にする、〜の世話をする」です。"],
        ["The train was (    ) by thirty minutes because of the accident.", ["delayed", "decided", "developed", "described"], "事故のため電車が「遅れた」は be delayed です。by thirty minutes は「30分」という差を表します。"],
        ["Neither my brother (    ) I like spicy food.", ["nor", "or", "and", "but"], "neither A nor B で「AもBも〜ない」です。"],
        ["She is one of the (    ) famous writers in Japan.", ["most", "more", "much", "very"], "one of the + 最上級 + 複数名詞 で「最も〜な…の一人」です。"],
        ["I'll call you as soon as I (    ) at the station.", ["arrive", "will arrive", "arrived", "arriving"], "時を表す as soon as の後ろでは、未来のことでも現在形を使います。"],
        ["The teacher gave us some useful (    ) on how to write a good essay.", ["advice", "advise", "advices", "advised"], "advice（助言）は数えられない名詞なので -s を付けません。advise は動詞です。"],
        ["I ran (    ) an old friend at the supermarket yesterday.", ["into", "over", "out", "away"], "run into 〜 で「〜に偶然出会う」です。"]
    ]);

    const EIKEN2_QUESTIONS = buildSet('英検2級', [
        ["(    ) the bad weather, the game was held as scheduled.", ["Despite", "Although", "Because", "Unless"], "後ろが名詞（the bad weather）なので前置詞 Despite（〜にもかかわらず）を使います。Although は後ろに文が続きます。"],
        ["If I had known the truth yesterday, I (    ) him then.", ["would have helped", "would help", "will help", "had helped"], "過去の事実に反する仮定は仮定法過去完了：If + had + 過去分詞, would have + 過去分詞 です。"],
        ["The new rule will (    ) effect next month.", ["take", "make", "bring", "give"], "take effect で「（法律・規則などが）効力を生じる、実施される」です。"],
        ["The scientist's discovery had a great (    ) on modern medicine.", ["impact", "income", "instinct", "instrument"], "have an impact on 〜 で「〜に影響を与える」です。"],
        ["Hardly (    ) I closed my eyes when the phone rang.", ["had", "did", "was", "have"], "Hardly had S + 過去分詞 when … で「〜するとすぐに…」。否定語が文頭に来ると倒置が起こります。"],
        ["She is said (    ) a famous singer when she was young.", ["to have been", "to be", "being", "that she was"], "述語（is said：現在）より前の時点のことなので完了不定詞 to have been を使います。"],
        ["The government plans to (    ) the use of plastic bags.", ["reduce", "reveal", "remind", "resemble"], "レジ袋の使用を「減らす」reduce が適切です。"],
        ["(    ) you need any help, please let me know.", ["Should", "Would", "Could", "Unless"], "If you should need 〜 の if を省略すると Should が文頭に出ます（倒置）。「万一〜なら」の意味です。"],
        ["It is no use (    ) over spilt milk.", ["crying", "cry", "cried", "being cried"], "It is no use 〜ing で「〜しても無駄だ」。「覆水盆に返らず」にあたることわざです。"],
        ["The more you practice, (    ) you will become.", ["the better", "better", "the best", "best"], "The 比較級 〜, the 比較級 … で「〜すればするほど…」です。"],
        ["I'll lend you the book (    ) you promise to return it by Friday.", ["as long as", "even though", "so that", "in case"], "as long as 〜 で「〜しさえすれば、〜する限りは」と条件を表します。"],
        ["The meeting was (    ) because many members could not attend.", ["postponed", "promoted", "persuaded", "predicted"], "多くのメンバーが出席できないので会議が「延期された」postponed が適切です。"],
        ["He was made (    ) for two hours.", ["to wait", "wait", "waiting", "waited"], "使役の make を受け身にすると、動詞の原形が to 不定詞になります（be made to 〜）。"],
        ["We have to (    ) with the problem as soon as possible.", ["deal", "look", "put", "turn"], "deal with 〜 で「〜に対処する」です。"],
        ["Not until he lost his health (    ) realize its importance.", ["did he", "he did", "he does", "does he"], "Not until 〜 が文頭に来ると、主節が倒置（did he realize）になります。「〜して初めて…した」の意味です。"],
        ["This ticket is (    ) for one year from the date of purchase.", ["valid", "vacant", "vital", "vague"], "チケットなどが「有効な」は valid です。"],
        ["The building, (    ) roof was damaged by the storm, is being repaired.", ["whose", "which", "that", "of which"], "「その屋根が」と所有を表すので関係代名詞 whose を使います（the roof of which でも同じ意味）。"],
        ["I would appreciate it (    ) you could reply soon.", ["if", "that", "when", "whether"], "I would appreciate it if 〜 で「〜していただけるとありがたいです」という丁寧な依頼です。"],
        ["This medicine will (    ) your headache.", ["relieve", "reserve", "reject", "remain"], "痛みを「和らげる」は relieve です。"],
        ["She has a (    ) for languages; she speaks five fluently.", ["talent", "tendency", "temper", "tension"], "have a talent for 〜 で「〜の才能がある」です。"]
    ]);

    const BOKI_QUESTIONS = [
        { title: "【日商簿記 問1】損益計算書（P/L）において「売上高」から「売上原価」を控除した利益はどれか。", options: ["売上総利益", "営業利益", "経常利益", "当期純利益"], correctIndex: 0, explanation: "売上高 － 売上原価 ＝ 売上総利益（粗利益）です。" },
        { title: "【日商簿記 問2】商品を仕入れ、代金は後払い（掛け）とした場合の勘定科目はどれか。", options: ["買掛金", "売掛金", "未払金", "前払金"], correctIndex: 0, explanation: "商品等の営業取引に伴う未払い代金は「買掛金」として処理します。" },
        { title: "【日商簿記 問3】固定資産の価値の減少を毎期の費用として配分・計上する手続はどれか。", options: ["減価償却", "貸倒処理", "評価替え", "引当金繰入"], correctIndex: 0, explanation: "建物や備品などの固定資産の取得原価を耐用年数に応じて費用配分するのが「減価償却」です。" },
        { title: "【日商簿記 問4】企業の一定時点における財政状態（資産・負債・純資産）を表す書類はどれか。", options: ["貸借対照表 (B/S)", "損益計算書 (P/L)", "キャッシュ・フロー計算書", "試算表"], correctIndex: 0, explanation: "貸借対照表（Balance Sheet）は特定の基準時点における財政状態を示します。" },
        { title: "【日商簿記 問5】売掛金が回収不能（倒産等）になった際に計上する費用勘定はどれか。", options: ["貸倒損失", "貸倒引当金繰入", "雑損失", "売上値引"], correctIndex: 0, explanation: "債権の回収が不能となった場合は「貸倒損失」等で処理します。" },
        { title: "【日商簿記 問6】手形を銀行で割り引き、現金化した場合に発生する手数料に相当する勘定科目はどれか。", options: ["手形売却損", "支払利息", "雑費", "割引手数料"], correctIndex: 0, explanation: "受取手形を期日前に割り引いた際の差額費用は「手形売却損」勘定を用います。" },
        { title: "【日商簿記 問7】現金の実額が帳簿残高より少ない場合に、原因判明まで一時的に処理する勘定はどれか。", options: ["現金過不足", "仮払金", "雑損失", "未払金"], correctIndex: 0, explanation: "現金の実際有高と帳簿残高に不一致がある場合、一時的に「現金過不足」勘定で処理します。" },
        { title: "【日商簿記 問8】決算において、当期に発生した未払いの費用（電気代等）を計上する見越し処理の勘定はどれか。", options: ["未払費用", "前払費用", "未収収益", "前受収益"], correctIndex: 0, explanation: "当期にサービスを受けたが未払いの費用は「未払費用（負債）」として計上します。" },
        { title: "【日商簿記 問9】商品を売上げ、代金の一部を内金（前受け）として受け取った際の勘定科目はどれか。", options: ["前受金", "前払金", "仮受金", "預り金"], correctIndex: 0, explanation: "商品引き渡し前に受け取った内金・手付金は「前受金（負債）」となります。" },
        { title: "【日商簿記 問10】決算整理後、すべての収益・費用勘定を振り替えるための特殊な勘定はどれか。", options: ["損益", "繰越利益剰余金", "資本金", "残高"], correctIndex: 0, explanation: "決算において各収益・費用勘定の残高を集計するために「損益」勘定が用いられます。" },
        { title: "【日商簿記 問11】自社で使用するPCを購入し代金を小切手で支払った場合の貸方勘定科目はどれか。", options: ["当座預金", "現金", "小切手", "買掛金"], correctIndex: 0, explanation: "小切手の振出しによる支払いは「当座預金」の減少（貸方）として記帳します。" },
        { title: "【日商簿記 問12】商品の所有権が売り手から買い手へ移転した時に売上を計上する基準を何と呼ぶか。", options: ["実現主義", "現金主義", "発生主義", "権利確定主義"], correctIndex: 0, explanation: "損益計算における収益の計上は原則として「実現主義」に基づきます。" },
        { title: "【日商簿記 問13】備品を売却し、代金は翌月払いとなった場合の勘定科目はどれか。", options: ["未収入金", "売掛金", "前払金", "仮払金"], correctIndex: 0, explanation: "商品以外の資産（備品や土地等）を売却した未回収金は「未収入金」処理します。" },
        { title: "【日商簿記 問14】従業員の給料から源泉所得税を控除して一時的に預かった場合の勘定科目はどれか。", options: ["預り金", "未払金", "預け金", "仮受金"], correctIndex: 0, explanation: "会社が一時的に従業員等から預かる税金・社会保険料は「預り金（負債）」となります。" },
        { title: "【日商簿記 問15】減価償却費を直接資産の帳簿価格から差し引く記帳方法はどれか。", options: ["直接法", "間接法", "定額法", "定率法"], correctIndex: 0, explanation: "資産から直接差し引く方法を「直接法」、減価償却累計額を用いる方法を「間接法」と呼びます。" },
        { title: "【日商簿記 問16】当座預金口座の残高を超えて小切手を振り出せる契約を何と呼ぶか。", options: ["当座借越", "手形割引", "当座貸付", "当座借入"], correctIndex: 0, explanation: "銀行と契約を結ぶことで残高超過分を自動借入扱いにできる制度を「当座借越」と呼びます。" },
        { title: "【日商簿記 問17】損益計算書における「営業利益」の計算式として正しいものはどれか。", options: ["売上総利益 － 販売費及び一般管理費", "売上高 － 売上原価", "営業利益 ＋ 営業外収益 － 営業外費用", "経常利益 ＋ 特別利益 － 特別損失"], correctIndex: 0, explanation: "本業の儲けを示す営業利益は「売上総利益 － 販管費」で計算します。" },
        { title: "【日商簿記 問18】決算時に商品の棚卸を行った結果、帳簿数量より実質数量が少ない場合の損失勘定はどれか。", options: ["棚卸減耗損", "商品評価損", "売上原価", "雑損失"], correctIndex: 0, explanation: "数量の減少による損失は「棚卸減耗損」として処理します。" },
        { title: "【日商簿記 問19】買掛金を期日前に支払い、割引を受けた場合の勘定科目はどれか。", options: ["仕入割引", "売上割引", "雑収入", "仕入値引"], correctIndex: 0, explanation: "代金の早期決済に伴う利息相当額の免除は「仕入割引（営業外収益）」です。" },
        { title: "【日商簿記 問20】複式簿記において、借方合計額と貸方合計額が常に一致する原則を何と呼ぶか。", options: ["貸借平均の原則", "発生主義の原則", "継続性の原則", "明瞭性の原則"], correctIndex: 0, explanation: "すべての仕訳で借方と貸方の金額が必ず同額になる原則を「貸借平均の原則」と呼びます。" }
    ];

    // 問題セット生成ヘルパー
    // rows: [問題文, [正解, 誤答1, 誤答2, 誤答3], 解説]
    // データ上は正解を先頭に書き、出題時に選択肢をシャッフルする
    // 「【ITパスポート 問1】」のような検定名・番号の接頭辞を問題文から外す（検定名は別欄で表示する）
    function stripTitlePrefix(title) {
        return String(title || '').replace(/^【[^】]*問\s*\d+】\s*/, '');
    }

    function buildSet(label, rows) {
        return rows.map(([q, opts, explanation], i) => ({
            title: q,
            options: opts,
            correctIndex: 0,
            explanation
        }));
    }

    const FE_QUESTIONS = buildSet('基本情報', [
        ["10進数の13を2進数で表したものはどれか。", ["1101", "1011", "1110", "1001"], "13 = 8 + 4 + 1 なので、2進数では 1101 になります。"],
        ["後に格納したデータを先に取り出す（LIFO）データ構造はどれか。", ["スタック", "キュー", "リスト", "ヒープ"], "スタックは後入れ先出し（LIFO）、キューは先入れ先出し（FIFO）のデータ構造です。"],
        ["先に格納したデータを先に取り出す（FIFO）データ構造はどれか。", ["キュー", "スタック", "二分木", "ハッシュ表"], "キューは先入れ先出し（FIFO）で、待ち行列の処理などに使われます。"],
        ["要素数nの整列済み配列に対する二分探索の平均計算量はどれか。", ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], "二分探索は探索範囲を毎回半分にするため、計算量は O(log n) です。"],
        ["16進数の FF を10進数で表したものはどれか。", ["255", "256", "240", "15"], "FF = 15×16 + 15 = 255 です。"],
        ["2つの入力が異なるときにだけ1を出力する論理演算はどれか。", ["排他的論理和（XOR）", "論理積（AND）", "論理和（OR）", "否定論理積（NAND）"], "XOR は入力が異なるとき1、同じとき0を出力します。"],
        ["MTBFが450時間、MTTRが50時間の装置の稼働率はどれか。", ["0.90", "0.80", "0.95", "0.89"], "稼働率 = MTBF ÷ (MTBF + MTTR) = 450 ÷ 500 = 0.90 です。"],
        ["稼働率0.9の装置2台を並列に接続したシステム（どちらか1台が動けばよい）の稼働率はどれか。", ["0.99", "0.81", "0.90", "0.95"], "並列系の稼働率 = 1 − (1 − 0.9)² = 1 − 0.01 = 0.99 です。"],
        ["キャッシュメモリを設ける主な目的はどれか。", ["CPUと主記憶装置の処理速度の差を埋める", "主記憶装置の容量を仮想的に拡大する", "電源断時にデータを保持する", "外部記憶装置の故障に備える"], "キャッシュメモリは高速な小容量メモリで、CPUと主記憶の速度差を緩和します。容量の仮想的な拡大は仮想記憶の役割です。"],
        ["RAID1の特徴として適切なものはどれか。", ["同じデータを複数のディスクに書き込むミラーリング", "データを分散して書き込むストライピングのみを行う", "パリティを1台のディスクに集中して記録する", "パリティを複数ディスクに分散して記録する"], "RAID1はミラーリング、RAID0はストライピング、RAID5はパリティを分散記録する方式です。"],
        ["DNSの役割として適切なものはどれか。", ["ドメイン名とIPアドレスを対応付ける", "IPアドレスを動的に割り当てる", "電子メールを転送する", "通信を暗号化する"], "DNSは名前解決を行います。IPアドレスの動的割当てはDHCPの役割です。"],
        ["TCP/IPモデルにおいて、トランスポート層のプロトコルはどれか。", ["TCP", "IP", "HTTP", "Ethernet"], "TCPとUDPはトランスポート層、IPはインターネット層、HTTPはアプリケーション層のプロトコルです。"],
        ["サブネットマスクが255.255.255.0のネットワークで、ホストに割り当てられるアドレス数はどれか。", ["254", "256", "255", "128"], "ホスト部は8ビットで256通り。ネットワークアドレスとブロードキャストアドレスを除いた254個です。"],
        ["関係データベースの第3正規化で排除するものはどれか。", ["推移的関数従属", "繰返し項目", "部分関数従属", "主キー"], "第1正規化で繰返し項目、第2正規化で部分関数従属、第3正規化で推移的関数従属を排除します。"],
        ["SQLで、行をグループごとに集計するときに使う句はどれか。", ["GROUP BY", "ORDER BY", "WHERE", "DISTINCT"], "GROUP BY でグループ化し、COUNT や SUM などの集計関数と組み合わせて使います。"],
        ["複数のプロセスが互いに相手の確保している資源の解放を待ち続け、処理が進まなくなる状態はどれか。", ["デッドロック", "スラッシング", "オーバーフロー", "フラグメンテーション"], "デッドロックは資源の相互待ちで処理が停止する状態です。スラッシングはページングが多発して性能が極端に落ちる状態です。"],
        ["オブジェクト指向の「カプセル化」の説明として適切なものはどれか。", ["データとそれを操作する手続を一体化し、内部の詳細を隠蔽する", "既存クラスの性質を引き継いで新しいクラスを定義する", "同じメッセージに対しオブジェクトごとに異なる動作をする", "複数のクラスの共通部分を抽出する"], "カプセル化は情報隠蔽を実現します。2番目は継承、3番目はポリモーフィズム、4番目は汎化の説明です。"],
        ["プログラムの内部構造に着目し、命令や分岐を網羅するようにテストケースを設計する手法はどれか。", ["ホワイトボックステスト", "ブラックボックステスト", "回帰テスト", "受入れテスト"], "ホワイトボックステストは内部構造に基づく手法です。ブラックボックステストは入力と出力の仕様に基づきます。"],
        ["ディジタル署名によって確認できることはどれか。", ["送信者の真正性とメッセージが改ざんされていないこと", "メッセージの内容が第三者に読まれていないこと", "通信経路が暗号化されていること", "受信者が確実にメッセージを読んだこと"], "ディジタル署名は送信者の秘密鍵で作成し、公開鍵で検証することで、なりすましと改ざんを検知します。機密性は保証しません。"],
        ["ウォーターフォールモデルの特徴として適切なものはどれか。", ["要件定義から順に工程を進め、原則として前工程に戻らない", "短い期間で計画・実装・テストを繰り返す", "試作品を作成して利用者の評価を得ながら進める", "システムを独立した部分に分け、順次開発・リリースする"], "ウォーターフォールは工程を上流から順に進めるモデルです。2番目はアジャイル、3番目はプロトタイピングの説明です。"]
    ]);

    const AP_QUESTIONS = buildSet('応用情報', [
        ["稼働率0.9の装置と稼働率0.8の装置を直列に接続したシステムの稼働率はどれか。", ["0.72", "0.98", "0.85", "0.80"], "直列系の稼働率は各装置の稼働率の積です。0.9 × 0.8 = 0.72 です。"],
        ["仮想記憶のページ置換えアルゴリズムLRUの説明として適切なものはどれか。", ["最後に参照されてから最も長い時間が経過したページを置き換える", "最も早く主記憶に読み込まれたページを置き換える", "参照回数が最も少ないページを置き換える", "ランダムに選んだページを置き換える"], "LRU（Least Recently Used）は最も長く使われていないページを追い出します。2番目はFIFO、3番目はLFUです。"],
        ["SQLインジェクション対策として最も効果的なものはどれか。", ["プレースホルダ（バインド機構）を使ってSQL文を組み立てる", "パスワードを定期的に変更する", "通信をTLSで暗号化する", "ファイアウォールで不要なポートを閉じる"], "プレースホルダを使うと入力値がSQL文の構造として解釈されなくなるため、SQLインジェクションの根本的な対策になります。"],
        ["クロスサイトスクリプティング（XSS）対策として適切なものはどれか。", ["Webページに出力する文字列を適切にエスケープする", "データベースへの接続にプレースホルダを使う", "セッションIDを長くする", "サーバのログを定期的に削除する"], "XSSは出力時に特殊文字をエスケープすることで、スクリプトとして実行されるのを防ぎます。"],
        ["トランザクションのACID特性のうち「原子性（Atomicity）」の説明はどれか。", ["トランザクションの処理がすべて実行されるか、まったく実行されないかのどちらかである", "トランザクションの実行前後でデータの整合性が保たれる", "同時に実行されるトランザクションが互いに影響しない", "確定した結果は障害が起きても失われない"], "2番目は一貫性（Consistency）、3番目は独立性（Isolation）、4番目は耐久性（Durability）の説明です。"],
        ["分散データベースで2相コミットを用いる目的はどれか。", ["すべてのサイトでコミットまたはロールバックを一致させる", "検索処理を高速化する", "データを自動的に暗号化する", "ネットワークの帯域を削減する"], "2相コミットは、準備フェーズとコミットフェーズの2段階で、全サイトの更新結果を一致させます。"],
        ["PKIにおいて、有効期限内に失効した証明書の一覧はどれか。", ["CRL", "CSR", "CA", "OCSPレスポンダ"], "CRL（Certificate Revocation List）は失効した証明書の一覧です。CSRは証明書の発行要求、CAは認証局です。"],
        ["ITILにおけるインシデント管理の主な目的はどれか。", ["中断したサービスを可能な限り迅速に回復させる", "インシデントの根本原因を特定して再発を防ぐ", "変更によるリスクを評価して承認する", "サービスの提供費用を算出する"], "インシデント管理は迅速な回復を目的とします。根本原因の究明は問題管理、変更の評価は変更管理の役割です。"],
        ["SLA（サービスレベル合意書）の説明として適切なものはどれか。", ["サービスの提供者と利用者の間で、サービスの品質水準を合意した文書", "システム開発の作業手順を定めた社内規程", "ソフトウェアの使用許諾条件", "情報セキュリティ方針を定めた文書"], "SLAには可用性や応答時間などのサービスレベルと、未達時の扱いなどを定めます。"],
        ["プロジェクトのEVMで、コスト効率を示すCPIの計算式はどれか。", ["EV ÷ AC", "EV ÷ PV", "EV − AC", "PV − AC"], "CPI = EV（出来高）÷ AC（実コスト）。1未満ならコスト超過です。スケジュール効率SPIは EV ÷ PV です。"],
        ["ファンクションポイント法の説明として適切なものはどれか。", ["システムの機能の数と複雑さから開発規模を見積もる", "ソースコードの行数から開発規模を見積もる", "過去の類似プロジェクトとの比較で見積もる", "作業を細分化して積み上げで見積もる"], "ファンクションポイント法は入出力や内部ファイルなどの機能を数え、複雑さで重み付けして規模を見積もります。"],
        ["命令の実行を複数の段階に分け、各段階を並行して処理することで処理効率を高める方式はどれか。", ["パイプライン処理", "マルチプログラミング", "仮想記憶", "割込み処理"], "パイプラインは命令の取出し、解読、実行などの段階をずらして重ね合わせ、全体の処理量を増やします。"],
        ["コンテナ型仮想化の特徴として適切なものはどれか。", ["ホストOSのカーネルを共有するため、仮想マシンより軽量に起動できる", "コンテナごとに異なるOSカーネルを動かす", "ハイパーバイザ上でゲストOSを丸ごと動かす", "物理サーバを複数台に分割する装置である"], "コンテナはOSカーネルを共有してプロセスを隔離するため、ゲストOSを持つ仮想マシンより起動が速く軽量です。"],
        ["ネットワーク機器の制御機能をソフトウェアで集中管理し、ネットワーク構成を柔軟に変更できるようにする技術はどれか。", ["SDN", "VPN", "NAT", "VLAN"], "SDN（Software-Defined Networking）は、制御（コントロールプレーン）と転送（データプレーン）を分けて集中制御します。"],
        ["継続的インテグレーション（CI）の説明として適切なものはどれか。", ["コードの変更を頻繁に統合し、自動でビルドとテストを行う", "リリース前にまとめて結合テストを行う", "本番環境を2系統用意して切り替える", "仕様書を先に完成させてから実装する"], "CIでは小さな変更をこまめに統合し、自動テストで問題を早く見つけます。"],
        ["情報セキュリティマネジメントシステム（ISMS）の要求事項を定めた国際規格はどれか。", ["ISO/IEC 27001", "ISO 9001", "ISO 14001", "ISO/IEC 20000-1"], "ISO/IEC 27001はISMS、ISO 9001は品質、ISO 14001は環境、ISO/IEC 20000-1はITサービスマネジメントの規格です。"],
        ["固定費が200万円、変動費率が0.6のとき、損益分岐点売上高はどれか。", ["500万円", "333万円", "320万円", "120万円"], "損益分岐点売上高 = 固定費 ÷ (1 − 変動費率) = 200 ÷ 0.4 = 500万円です。"],
        ["ROE（自己資本利益率）の計算式はどれか。", ["当期純利益 ÷ 自己資本", "当期純利益 ÷ 総資本", "営業利益 ÷ 売上高", "自己資本 ÷ 総資本"], "ROEは株主の出資に対してどれだけ利益を上げたかを示します。2番目はROA、4番目は自己資本比率です。"],
        ["請負契約で、発注者が受注者の労働者に直接作業の指揮命令を行うと生じる問題はどれか。", ["偽装請負とみなされるおそれがある", "著作権が自動的に発注者へ移転する", "契約が自動的に準委任契約になる", "下請代金の支払期日が延長される"], "請負では指揮命令権は受注者にあります。発注者が直接指示すると実態が労働者派遣となり、偽装請負とみなされるおそれがあります。"],
        ["ハッシュ表探索の平均計算量（衝突が少ない場合）はどれか。", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "ハッシュ関数で格納位置を直接求めるため、衝突が少なければ平均 O(1) で探索できます。"]
    ]);

    const TOEIC_QUESTIONS = buildSet('TOEIC', [
        ["The quarterly report must be submitted _______ the end of the month.", ["by", "until", "since", "among"], "「〜までに（期限）」は by。until は「〜までずっと（継続）」です。"],
        ["Ms. Tanaka was promoted because she _______ exceeded her sales targets.", ["consistently", "consistent", "consistency", "consist"], "動詞 exceeded を修飾するので副詞 consistently（一貫して）が入ります。"],
        ["All employees are required to wear identification badges _______ in the building.", ["while", "during", "because", "although"], "while in the building（建物内にいる間）。while の後は主語と be 動詞が省略できます。during の後には名詞が続きます。"],
        ["The new software will allow us to process orders more _______.", ["efficiently", "efficient", "efficiency", "efficiencies"], "動詞 process を修飾するので副詞 efficiently です。"],
        ["Please _______ the attached document and send your comments by Friday.", ["review", "reviewing", "reviewed", "to review"], "Please に続く命令文なので動詞の原形 review です。"],
        ["The marketing team has _______ received approval for the campaign budget.", ["already", "yet", "ever", "still"], "肯定文の現在完了で「すでに」は already。yet は主に否定文・疑問文で使います。"],
        ["Ms. Lee is responsible _______ coordinating the training sessions.", ["for", "of", "to", "with"], "be responsible for 〜（〜に責任がある・〜を担当している）です。"],
        ["The shipment was delayed _______ severe weather conditions.", ["because of", "even though", "so that", "in case"], "後ろが名詞句なので前置詞の because of。even though と so that は後ろに節が続きます。"],
        ["The applicants _______ résumés were selected will be contacted next week.", ["whose", "who", "whom", "which"], "「その応募者の履歴書」と所有を表すので関係代名詞 whose です。"],
        ["Sales have increased _______ 15 percent since last year.", ["by", "at", "on", "with"], "増減の幅を表す前置詞は by（〜だけ）です。"],
        ["The company plans to _______ its operations to Southeast Asia.", ["expand", "expansion", "expansive", "expandable"], "to 不定詞の後なので動詞の原形 expand（拡大する）です。"],
        ["If the item _______ damaged, please contact customer service immediately.", ["is", "be", "being", "to be"], "条件を表す if 節では、未来のことでも現在形を使います。"],
        ["The seminar was so _______ that many attendees asked for additional sessions.", ["informative", "informed", "inform", "information"], "セミナー自体が「有益な」なので形容詞 informative。informed は「情報を得た（人）」の意味です。"],
        ["Mr. Garcia has worked at the firm _______ more than ten years.", ["for", "since", "during", "while"], "期間の長さ（more than ten years）を表すので for。since の後には起点が来ます。"],
        ["Employees may leave early _______ they have completed their assigned tasks.", ["provided that", "in spite of", "regarding", "despite"], "後ろに節が続き「〜という条件で」の意味なので provided that。in spite of と despite の後は名詞です。"],
        ["The budget proposal must be approved by the director _______ it can be implemented.", ["before", "since", "whereas", "despite"], "「実施できるようになる前に承認が必要」なので before です。"],
        ["Our office will be closed on Monday _______ the national holiday.", ["in observance of", "in addition", "as well", "in order"], "in observance of 〜（〜を祝して・〜に従って）。祝日による休業の案内でよく使われます。"],
        ["Customers who buy two items will receive a third _______ free of charge.", ["one", "it", "ones", "them"], "不特定の同種のもの1つを指すので代名詞 one です。"],
        ["_______ the manager nor her assistant was available to answer the call.", ["Neither", "Either", "Both", "Not"], "後ろに nor があるので Neither A nor B（AもBも〜ない）です。"],
        ["The conference room is already booked for the board meeting, _______ we will use the lounge instead.", ["so", "but", "or", "because"], "「会議室が予約済みなので、ラウンジを使う」という因果関係なので so です。"]
    ]);

    const FP_QUESTIONS = buildSet('FP', [
        ["老齢基礎年金の受給開始年齢（原則）はどれか。", ["65歳", "60歳", "62歳", "70歳"], "老齢基礎年金は原則65歳から受給します。60〜75歳の範囲で繰上げ・繰下げも可能です。"],
        ["国民年金の第1号被保険者に該当するのはどれか。", ["20歳以上60歳未満の自営業者", "会社員などの厚生年金保険の被保険者", "会社員に扶養されている20歳以上60歳未満の配偶者", "65歳以上の年金受給者"], "第1号は自営業者や学生など、第2号は会社員・公務員、第3号は第2号に扶養される配偶者です。"],
        ["「72の法則」によると、年利6%（複利）で運用した元本が約2倍になるのは何年後か。", ["約12年", "約6年", "約18年", "約24年"], "72 ÷ 金利(%) で倍になる年数の目安が求められます。72 ÷ 6 = 12年です。"],
        ["預金保険制度で、利息の付く普通預金が保護される範囲はどれか。", ["1金融機関ごとに元本1,000万円までとその利息", "1金融機関ごとに元本500万円まで", "金額にかかわらず全額", "1人あたり全金融機関合計で1,000万円まで"], "一般預金等は1金融機関ごとに元本1,000万円とその利息が保護されます。利息の付かない決済用預金は全額保護されます。"],
        ["所得税の税率の仕組みとして適切なものはどれか。", ["超過累進税率", "単一の比例税率", "定額の人頭税", "逆進税率"], "所得税は所得が一定額を超えた部分にだけ高い税率を適用する超過累進税率です。"],
        ["定期保険の特徴として適切なものはどれか。", ["一定期間の死亡保障があり、満期保険金はない", "一生涯の死亡保障がある", "満期時に死亡保険金と同額の満期保険金がある", "死亡保障はなく医療保障のみである"], "定期保険は保障期間が決まった掛け捨て型の保険です。2番目は終身保険、3番目は養老保険の特徴です。"],
        ["高額療養費制度の説明として適切なものはどれか。", ["1か月の医療費の自己負担額が上限を超えた分が払い戻される", "入院時の食事代が全額支給される", "差額ベッド代が払い戻される", "年間の医療費が10万円を超えると税金が還付される"], "高額療養費は月ごとの自己負担上限を超えた分を支給する制度です。食事代や差額ベッド代は対象外で、4番目は医療費控除の説明です。"],
        ["株式投資の指標PER（株価収益率）の計算式はどれか。", ["株価 ÷ 1株当たり純利益", "株価 ÷ 1株当たり純資産", "1株当たり配当金 ÷ 株価", "当期純利益 ÷ 自己資本"], "PERは株価が利益の何倍かを示します。2番目はPBR、3番目は配当利回り、4番目はROEです。"],
        ["2024年からのNISAで、つみたて投資枠の年間投資上限額はどれか。", ["120万円", "40万円", "240万円", "360万円"], "つみたて投資枠は年120万円、成長投資枠は年240万円で、合計の年間上限は360万円です。"],
        ["相続税の遺産に係る基礎控除額の計算式はどれか。", ["3,000万円 + 600万円 × 法定相続人の数", "5,000万円 + 1,000万円 × 法定相続人の数", "1,000万円 + 500万円 × 法定相続人の数", "110万円 × 法定相続人の数"], "現行の基礎控除額は 3,000万円 + 600万円 × 法定相続人の数 です。"],
        ["贈与税（暦年課税）の基礎控除額は年間いくらか。", ["110万円", "60万円", "200万円", "2,500万円"], "暦年課税の基礎控除は受贈者1人あたり年110万円です。2,500万円は相続時精算課税の特別控除額です。"],
        ["固定資産税の納税義務者はどれか。", ["毎年1月1日時点で固定資産課税台帳に所有者として登録されている者", "毎年4月1日時点の所有者", "その年に固定資産を取得したすべての者", "固定資産の居住者"], "固定資産税は1月1日（賦課期日）時点の所有者に、市町村が課税します。"],
        ["住宅ローンの元利均等返済の特徴として適切なものはどれか。", ["毎回の返済額（元金と利息の合計）が一定である", "毎回返済する元金の額が一定である", "返済当初の返済額が最も多い", "同じ条件なら元金均等返済より総返済額が少ない"], "元利均等返済は返済額が一定で計画が立てやすい一方、元金均等返済より総返済額は多くなります。"],
        ["一般に、市場金利が上昇したときの既発債券の価格はどうなるか。", ["下落する", "上昇する", "変わらない", "額面の2倍になる"], "市場金利が上がると、利率の低い既発債券の魅力が下がるため、価格は下落します。"],
        ["e-Taxでの申告など一定の要件を満たした場合の、青色申告特別控除の最高額はどれか。", ["65万円", "10万円", "55万円", "100万円"], "正規の簿記で記帳し、e-Tax申告などの要件を満たすと最高65万円、要件を満たさない場合は55万円などとなります。"],
        ["相続人が配偶者と子の場合、配偶者の法定相続分はどれか。", ["2分の1", "3分の2", "4分の3", "3分の1"], "配偶者と子なら配偶者1/2、配偶者と直系尊属なら2/3、配偶者と兄弟姉妹なら3/4です。"],
        ["生命保険のリビング・ニーズ特約の説明として適切なものはどれか。", ["余命6か月以内と判断された場合に死亡保険金の一部または全部を生前に受け取れる", "入院1日目から入院給付金が受け取れる", "保険料の払込みが免除される", "解約返戻金が増える"], "リビング・ニーズ特約は余命6か月以内と診断されたとき、死亡保険金を生前に受け取れる特約で、特約保険料は不要です。"],
        ["医療費控除（通常）で、支払った医療費から差し引く金額はどれか（総所得金額等が200万円以上の場合）。", ["10万円", "5万円", "20万円", "1万2千円"], "医療費控除は（医療費 − 保険金等の補てん額 − 10万円）で計算します。総所得金額等が200万円未満なら10万円ではなくその5%です。"],
        ["一定金額で定期的に同じ金融商品を購入し続ける投資手法はどれか。", ["ドル・コスト平均法", "バリュー投資", "インデックス運用", "レバレッジ投資"], "ドル・コスト平均法は、価格が高いときは少なく、安いときは多く買うことになり、平均購入単価を平準化できます。"],
        ["2つの資産の相関係数がいくつのとき、分散投資によるリスク低減効果が最も大きいか。", ["−1", "0", "+1", "+0.5"], "相関係数が −1 のとき2資産は正反対に動くため、リスク低減効果が最大になります。+1 では効果がありません。"]
    ]);

    const TAKKEN_QUESTIONS = buildSet('宅建', [
        ["宅地建物取引業の免許の有効期間はどれか。", ["5年", "3年", "7年", "10年"], "宅建業の免許の有効期間は5年です。更新は満了の90日前から30日前までに申請します。"],
        ["重要事項の説明を行わなければならない時期はどれか。", ["契約が成立するまでの間", "契約成立後、遅滞なく", "物件の引渡し時", "代金の支払い時"], "35条の重要事項説明は契約成立前に、宅地建物取引士が取引士証を提示して行います。"],
        ["宅建業者が自ら売主で買主が宅建業者でない場合、受け取れる手付金の上限はどれか。", ["代金の10分の2", "代金の10分の1", "代金の5%", "代金の3分の1"], "8種制限により、手付金は代金の10分の2（20%）を超えて受け取ることができません。"],
        ["営業保証金として、主たる事務所について供託すべき額はどれか。", ["1,000万円", "500万円", "60万円", "30万円"], "営業保証金は主たる事務所1,000万円、その他の事務所1か所につき500万円です。"],
        ["事務所等以外の場所でした申込みについて、クーリング・オフができるのは、書面で告げられた日から何日間か。", ["8日間", "7日間", "14日間", "30日間"], "クーリング・オフについて書面で告げられた日から起算して8日間は、申込みの撤回や契約の解除ができます。"],
        ["専任媒介契約の有効期間の上限はどれか。", ["3か月", "1か月", "6か月", "1年"], "専任媒介・専属専任媒介契約の有効期間は3か月が上限で、これより長い期間を定めても3か月となります。"],
        ["売買代金が400万円を超える場合の、宅建業者が売主・買主の一方から受け取れる報酬の上限（速算式・消費税抜き）はどれか。", ["代金の3% + 6万円", "代金の5%", "代金の4% + 2万円", "代金の1か月分"], "400万円を超える売買の媒介報酬は「代金 × 3% + 6万円」（別途消費税）が上限です。"],
        ["事務所ごとに置かなければならない専任の宅地建物取引士の数はどれか。", ["業務に従事する者5人に1人以上", "業務に従事する者10人に1人以上", "事務所ごとに1人以上", "業務に従事する者3人に1人以上"], "事務所には、業務に従事する者5人に1人以上の割合で成年の専任取引士を置く必要があります。"],
        ["宅建業者が契約成立後に遅滞なく交付する37条書面に記名しなければならない者はどれか。", ["宅地建物取引士", "宅建業者の代表者のみ", "買主", "国土交通大臣"], "37条書面（契約書面）には宅地建物取引士の記名が必要です。説明の義務はありません。"],
        ["借地借家法上の普通借地権の存続期間（当初）はどれか。", ["30年", "20年", "50年", "10年"], "普通借地権の存続期間は30年です。これより長い期間を定めた場合はその期間となります。"],
        ["期間を1年未満と定めた普通建物賃貸借の扱いはどれか。", ["期間の定めがない建物賃貸借とみなされる", "期間は1年となる", "契約は無効となる", "定めた期間のとおり有効である"], "借地借家法では、期間1年未満の普通建物賃貸借は期間の定めがないものとみなされます（定期建物賃貸借を除く）。"],
        ["民法上、成年とされる年齢はどれか。", ["18歳", "20歳", "16歳", "22歳"], "2022年4月の民法改正で成年年齢は18歳に引き下げられました。"],
        ["都市計画法の市街化調整区域の説明として適切なものはどれか。", ["市街化を抑制すべき区域", "すでに市街地を形成している区域", "おおむね10年以内に優先的に市街化を図る区域", "用途地域を必ず定める区域"], "市街化調整区域は市街化を抑制する区域です。2・3番目は市街化区域の説明です。"],
        ["建築基準法の建ぺい率の説明として適切なものはどれか。", ["建築面積の敷地面積に対する割合", "延べ面積の敷地面積に対する割合", "建物の高さの道路幅員に対する割合", "緑地面積の敷地面積に対する割合"], "建ぺい率は建築面積 ÷ 敷地面積、容積率は延べ面積 ÷ 敷地面積です。"],
        ["都市計画法で定められている用途地域の種類はいくつか。", ["13種類", "12種類", "10種類", "15種類"], "2018年に田園住居地域が加わり、用途地域は13種類になりました。"],
        ["不動産登記簿の権利部（甲区）に記録される事項はどれか。", ["所有権に関する事項", "抵当権に関する事項", "土地の地目や地積", "建物の構造や床面積"], "甲区は所有権、乙区は抵当権など所有権以外の権利を記録します。地目・構造などは表題部です。"],
        ["抵当権の特徴として適切なものはどれか。", ["目的物の占有を移さずに、優先して弁済を受けられる", "目的物を債権者が占有しなければ成立しない", "動産にしか設定できない", "被担保債権がなくても存続する"], "抵当権は設定者が使用を続けたまま設定でき、債権が消滅すれば抵当権も消滅します（付従性）。"],
        ["占有の開始時に悪意だった者が、所有の意思をもって平穏・公然に他人の物を占有した場合、所有権を時効取得できる期間はどれか。", ["20年", "10年", "5年", "15年"], "占有開始時に善意無過失なら10年、それ以外は20年で時効取得します。"],
        ["農地を農地のまま売買する場合（農地法3条）に必要な許可はどれか。", ["農業委員会の許可", "都道府県知事の許可", "市町村長への届出のみ", "国土交通大臣の許可"], "農地法3条の権利移動は、原則として農業委員会の許可が必要です。"],
        ["不動産取得税を課税するのはどこか。", ["都道府県", "市町村", "国", "法務局"], "不動産取得税は都道府県税です。固定資産税は市町村税、登録免許税は国税です。"]
    ]);

    // ===== 日本漢字能力検定（級別） =====
    // 各級の出題範囲・出題形式を参考にしたオリジナル問題（級の割り当ては目安）
    const KANKEN4_QUESTIONS = buildSet('漢検4級', [
        ["「鋭い」の読みとして正しいものはどれか。", ["するどい", "けわしい", "するどたい", "えいい"], "「鋭」の訓読みは「するど（い）」です。音読みは「エイ」（例：鋭利）。"],
        ["「恵み」の読みとして正しいものはどれか。", ["めぐみ", "めぐみい", "けいみ", "えみ"], "「恵」の訓読みは「めぐ（む）」。音読みは「ケイ」「エ」（例：恩恵、知恵）です。"],
        ["「傾斜」の読みとして正しいものはどれか。", ["けいしゃ", "こうしゃ", "けいや", "ひんしゃ"], "傾斜（けいしゃ）は、斜めに傾いていることです。"],
        ["「範囲」の読みとして正しいものはどれか。", ["はんい", "ばんい", "はんかこ", "へんい"], "範囲（はんい）は、ある決まった広がりや限られた区域のことです。"],
        ["「微妙」の読みとして正しいものはどれか。", ["びみょう", "みみょう", "びしょう", "ちょうみょう"], "微妙（びみょう）は、細かく複雑で、簡単には言い表せないさまです。"],
        ["「休日にキュウカを取る」の「キュウカ」を漢字で書いたものはどれか。", ["休暇", "休化", "休火", "求暇"], "「暇」は「ひま・カ」。休暇（きゅうか）は勤め先などを休むことです。"],
        ["「状況をハンダンする」の「ハンダン」を漢字で書いたものはどれか。", ["判断", "判段", "反断", "判談"], "物事の良し悪しや真偽を見きわめて決めることは「判断」です。"],
        ["「ユダン大敵」の「ユダン」を漢字で書いたものはどれか。", ["油断", "油段", "由断", "輸断"], "油断（ゆだん）は気をゆるめて注意を怠ることです。"],
        ["「冷めないうちにアタタかい料理を食べる」の「アタタかい」を正しく書いたものはどれか。", ["温かい", "暖かい", "温たかい", "暖たかい"], "料理や心など、物の温度や心情には「温かい」、気候や気温には「暖かい」を使います。"],
        ["「おどろく」を漢字と送り仮名で正しく書いたものはどれか。", ["驚く", "驚ろく", "驚どろく", "警く"], "「驚」の訓読みは「おどろ（く）」なので、送り仮名は「く」です。"],
        ["漢字「腕」の部首はどれか。", ["月（にくづき）", "夕（ゆうべ）", "卩（ふしづくり）", "宀（うかんむり）"], "体に関する字の多くは「月（にくづき）」が部首です（腕・胸・脈など）。"],
        ["漢字「疲」の部首はどれか。", ["疒（やまいだれ）", "广（まだれ）", "皮（けがわ）", "又（また）"], "病気や体の不調を表す字の部首は「疒（やまいだれ）」です（疲・病・症など）。"],
        ["漢字「延」の総画数はどれか。", ["8画", "7画", "6画", "9画"], "「延」は8画です。「廴（えんにょう）」は最後に書きます。"],
        ["「慎重」の対義語はどれか。", ["軽率", "丁寧", "用心", "冷静"], "注意深く行う「慎重」に対し、よく考えずに軽はずみに行うことは「軽率」です。"],
        ["「方法」の類義語はどれか。", ["手段", "目的", "結果", "原因"], "目的を果たすためのやり方という意味で「方法」と「手段」は類義語です。"],
        ["四字熟語「□刀直入」の□に入る漢字はどれか。", ["単", "短", "端", "担"], "単刀直入（たんとうちょくにゅう）は、前置きなしにいきなり本題に入ることです。"],
        ["「異口同音」の読みとして正しいものはどれか。", ["いくどうおん", "いこうどうおん", "いくどういん", "ことぐちどうおん"], "異口同音（いくどうおん）は、多くの人が口をそろえて同じことを言うことです。"],
        ["熟語「登山」の構成として正しいものはどれか。", ["下の字が上の字の目的・対象を表す", "同じような意味の字を重ねる", "反対の意味の字を重ねる", "上の字が下の字を修飾する"], "「登山」は「山に登る」で、下の字が上の字の目的を表す構成です。"],
        ["「キ険な場所には近づかない」の「キ」に当てはまる漢字はどれか。", ["危", "奇", "既", "希"], "危険（きけん）は、あぶないことです。"],
        ["「選手が力をキソう」の「キソう」を正しく書いたものはどれか。", ["競う", "競そう", "争う", "競る"], "互いに勝とうとして張り合う意味の「きそう」は「競う」と書きます。"]
    ]);

    const KANKEN3_QUESTIONS = buildSet('漢検3級', [
        ["「詐欺」の読みとして正しいものはどれか。", ["さぎ", "さき", "さくぎ", "さっき"], "詐欺（さぎ）は、人をだまして金品をとったり損害を与えたりすることです。"],
        ["「慰める」の読みとして正しいものはどれか。", ["なぐさめる", "いさめる", "なだめる", "あたためる"], "「慰」の訓読みは「なぐさ（める）」。音読みは「イ」（例：慰問）です。"],
        ["「陥る」の読みとして正しいものはどれか。", ["おちいる", "おとしいる", "かんいる", "おちる"], "「陥」の訓読みは「おちい（る）」「おとしい（れる）」です。"],
        ["「稼ぐ」の読みとして正しいものはどれか。", ["かせぐ", "かつぐ", "そそぐ", "かぐ"], "「稼」の訓読みは「かせ（ぐ）」。音読みは「カ」（例：稼働）です。"],
        ["「循環」の読みとして正しいものはどれか。", ["じゅんかん", "しゅんかん", "じゅんけん", "すいかん"], "循環（じゅんかん）は、ひと回りして元に戻ることを繰り返すことです。"],
        ["「架空」の読みとして正しいものはどれか。", ["かくう", "かそら", "けくう", "がくう"], "架空（かくう）は、事実に基づかず想像でつくり上げることです。"],
        ["「二つの案をヒカク検討する」の「ヒカク」を漢字で書いたものはどれか。", ["比較", "比格", "批較", "比確"], "比較（ひかく）は、二つ以上のものを比べ合わせることです。"],
        ["「シンセンな野菜」の「シンセン」を漢字で書いたものはどれか。", ["新鮮", "新選", "新線", "深鮮"], "新鮮（しんせん）は、新しくていきいきとしていることです。"],
        ["「混乱した事態をシュウシュウする」の「シュウシュウ」を漢字で書いたものはどれか。", ["収拾", "収集", "収縮", "修習"], "混乱をおさめてまとめることは「収拾」。物を集めることは「収集」です。"],
        ["「カンセイな住宅街」の「カンセイ」を漢字で書いたものはどれか。", ["閑静", "完成", "歓声", "慣性"], "閑静（かんせい）は、ひっそりとして静かなさまです。"],
        ["漢字「裁」の部首はどれか。", ["衣（ころも）", "戈（ほこづくり）", "土（つち）", "十（じゅう）"], "「裁」は衣服を仕立てることに関係し、部首は「衣（ころも）」です。"],
        ["漢字「募」の部首はどれか。", ["力（ちから）", "艹（くさかんむり）", "日（ひ）", "大（だい）"], "「募」の部首は下の「力（ちから）」です。"],
        ["「需要」の対義語はどれか。", ["供給", "生産", "消費", "要求"], "買いたいという「需要」に対し、売るために市場に出すことが「供給」です。"],
        ["「冷静」の類義語はどれか。", ["沈着", "興奮", "熱心", "冷淡"], "落ち着いて物事に動じないという意味で「冷静」と「沈着」は類義語です。"],
        ["四字熟語「起死□生」の□に入る漢字はどれか。", ["回", "再", "快", "会"], "起死回生（きしかいせい）は、絶望的な状態を立て直してよい方向に向かわせることです。"],
        ["四字熟語「我田引水」の意味として正しいものはどれか。", ["自分の都合のよいように言ったり、したりすること", "他人のために骨身を惜しまず働くこと", "水田を開いて農業を盛んにすること", "自分の考えを持たずに人に従うこと"], "自分の田にだけ水を引く様子から、自分に都合よく物事を進めることを表します。"],
        ["「あやうい」を漢字と送り仮名で正しく書いたものはどれか。", ["危うい", "危い", "危やうい", "危ない"], "「危」の訓読みは「あぶ（ない）」「あや（うい）」「あや（ぶむ）」です。"],
        ["熟語「未熟」の構成として正しいものはどれか。", ["上の字が下の字の意味を打ち消している", "同じような意味の字を重ねる", "下の字が上の字の目的を表す", "反対の意味の字を重ねる"], "「未熟」は「まだ熟していない」で、上の「未」が下の字を打ち消しています（不・非・無・未）。"],
        ["「キョウイ的な記録を出す」の「キョウイ」を漢字で書いたものはどれか。", ["驚異", "脅威", "胸囲", "強意"], "驚くほどすばらしいことは「驚異」。おびやかすことは「脅威」です。"],
        ["「哀愁」の読みとして正しいものはどれか。", ["あいしゅう", "あいしゅ", "いしゅう", "あいそう"], "哀愁（あいしゅう）は、もの悲しい気持ちのことです。"]
    ]);

    const KANKEN_P2_QUESTIONS = buildSet('漢検準2級', [
        ["「暫定」の読みとして正しいものはどれか。", ["ざんてい", "ぜんてい", "さんてい", "ざんじょう"], "暫定（ざんてい）は、正式に決まるまでの間、仮に定めることです。"],
        ["「享受」の読みとして正しいものはどれか。", ["きょうじゅ", "こうじゅ", "きょうず", "ていじゅ"], "享受（きょうじゅ）は、受け入れて自分のものとし、味わい楽しむことです。"],
        ["「懐柔」の読みとして正しいものはどれか。", ["かいじゅう", "かいにゅう", "ふところじゅう", "えじゅう"], "懐柔（かいじゅう）は、うまく扱って手なずけ、従わせることです。"],
        ["「措置」の読みとして正しいものはどれか。", ["そち", "しゃくち", "せきち", "そうち"], "措置（そち）は、事態に応じて必要な手続きや処置をとることです。"],
        ["「凡庸」の読みとして正しいものはどれか。", ["ぼんよう", "はんよう", "ぼんこう", "はんこう"], "凡庸（ぼんよう）は、平凡でとりえのないことです。"],
        ["「逓減」の読みとして正しいものはどれか。", ["ていげん", "たいげん", "でいげん", "しげん"], "逓減（ていげん）は、しだいに減ること、または減らすことです。"],
        ["「漸進」の読みとして正しいものはどれか。", ["ぜんしん", "ざんしん", "せんしん", "しゅうしん"], "漸進（ぜんしん）は、順を追って少しずつ進むことです。"],
        ["「バスがヒンパンに発着する」の「ヒンパン」を漢字で書いたものはどれか。", ["頻繁", "頻番", "貧繁", "品繁"], "頻繁（ひんぱん）は、しばしば行われること、たびたびです。"],
        ["「長年のケンアン事項」の「ケンアン」を漢字で書いたものはどれか。", ["懸案", "険案", "検案", "兼案"], "懸案（けんあん）は、解決されないまま問題として残っている事柄です。"],
        ["「誠にイカンに思う」の「イカン」を漢字で書いたものはどれか。", ["遺憾", "遺感", "意感", "移換"], "遺憾（いかん）は、思うようにならず残念に思うことです。"],
        ["「ジュンタクな資金」の「ジュンタク」を漢字で書いたものはどれか。", ["潤沢", "順沢", "潤択", "純沢"], "潤沢（じゅんたく）は、物が豊富にあることです。"],
        ["「話にカンキュウをつける」の「カンキュウ」を漢字で書いたものはどれか。", ["緩急", "緩久", "感急", "完急"], "緩急（かんきゅう）は、ゆるやかなことと、急なことです。"],
        ["漢字「畝」の部首はどれか。", ["田（た）", "亠（なべぶた）", "久（ひさし）", "十（じゅう）"], "「畝（うね）」は田畑に関係する字で、部首は「田」です。"],
        ["漢字「衷」の部首はどれか。", ["衣（ころも）", "中（なか）", "亠（なべぶた）", "丨（ぼう）"], "「衷」は「衣」の間に「中」が入った形で、部首は「衣（ころも）」です。"],
        ["四字熟語「□工異曲」の□に入る漢字はどれか。", ["同", "動", "道", "銅"], "同工異曲（どうこういきょく）は、見かけは違っても中身はほぼ同じであることです。"],
        ["四字熟語「付和雷同」の意味として正しいものはどれか。", ["自分の考えを持たず、他人の意見にすぐ同調すること", "皆が心を一つにして協力すること", "大きな音を立てて騒ぎ立てること", "他人の意見を聞かずに我を通すこと"], "雷が鳴ると物が響いて応じるように、むやみに他人に同調することを表します。"],
        ["「謙虚」の対義語はどれか。", ["尊大", "謙譲", "恭順", "卑屈"], "控えめで素直な「謙虚」に対し、いばって偉そうにすることが「尊大」です。"],
        ["「傍観」の類義語はどれか。", ["座視", "干渉", "注視", "参加"], "そばで見ているだけで手出しをしないという意味で「傍観」と「座視」は類義語です。"],
        ["「ほどこす」を漢字と送り仮名で正しく書いたものはどれか。", ["施す", "施こす", "施どこす", "給す"], "「施」の訓読みは「ほどこ（す）」なので、送り仮名は「す」です。"],
        ["熟語「抑揚」の構成として正しいものはどれか。", ["反対の意味の字を重ねる", "同じような意味の字を重ねる", "上の字が下の字を修飾する", "下の字が上の字の目的を表す"], "「抑（おさえる）」と「揚（あげる）」は反対の意味の字の組み合わせです。"]
    ]);

    const KANKEN2_QUESTIONS = buildSet('漢検2級', [
        ["「斬新」の読みとして正しいものはどれか。", ["ざんしん", "ぜんしん", "さんしん", "ざんじん"], "斬新（ざんしん）は、趣向が際立って新しいことです。"],
        ["「僅差」の読みとして正しいものはどれか。", ["きんさ", "ぎんさ", "きんしゃ", "わずさ"], "僅差（きんさ）は、ほんのわずかな差のことです。"],
        ["「拉致」の読みとして正しいものはどれか。", ["らち", "らっち", "りっち", "らいち"], "拉致（らち）は、無理に連れて行くことです。"],
        ["「破綻」の読みとして正しいものはどれか。", ["はたん", "はじょう", "はてい", "はかい"], "破綻（はたん）は、物事がうまくいかなくなり、行き詰まることです。"],
        ["「語彙」の読みとして正しいものはどれか。", ["ごい", "ごるい", "ごしゅう", "ごき"], "語彙（ごい）は、ある範囲で使われる語の集まりのことです。"],
        ["「進捗」の読みとして正しいものはどれか。", ["しんちょく", "しんしょう", "しんぽ", "しんぼく"], "進捗（しんちょく）は、物事がはかどること、進み具合です。"],
        ["「毀損」の読みとして正しいものはどれか。", ["きそん", "こそん", "ぎそん", "きぞん"], "毀損（きそん）は、物をこわしたり、名誉や信用を傷つけたりすることです。"],
        ["「謙遜」の読みとして正しいものはどれか。", ["けんそん", "けんしん", "けんぞん", "かんそん"], "謙遜（けんそん）は、へりくだって控えめにふるまうことです。"],
        ["「キュウチに追い込まれる」の「キュウチ」を漢字で書いたものはどれか。", ["窮地", "究地", "急地", "旧地"], "窮地（きゅうち）は、追いつめられて逃げ場のない苦しい立場です。"],
        ["「使わない筋肉がイシュクする」の「イシュク」を漢字で書いたものはどれか。", ["萎縮", "威縮", "偉縮", "移縮"], "しなびて縮むこと、衰えて小さくなることは「萎縮」と書きます。なお、おそれて縮こまる意味では「畏縮」と書きます。"],
        ["「制度のヘイガイを正す」の「ヘイガイ」を漢字で書いたものはどれか。", ["弊害", "幣害", "閉害", "並害"], "弊害（へいがい）は、害となる悪い影響のことです。「幣」（貨幣）と混同しないように注意。"],
        ["「ショウソウに駆られる」の「ショウソウ」を漢字で書いたものはどれか。", ["焦燥", "焦争", "傷操", "尚早"], "いらいらしてあせることは「焦燥」と書きます。「尚早」は時期が早すぎることです。"],
        ["漢字「爵」の部首はどれか。", ["爫（つめかんむり）", "寸（すん）", "罒（あみがしら）", "艮（こんづくり）"], "「爵」の部首は上の「爫（つめかんむり・つめがしら）」です。"],
        ["漢字「頒」の部首はどれか。", ["頁（おおがい）", "八（はち）", "刀（かたな）", "分（ぶん）"], "「頒」の部首は右側の「頁（おおがい）」です。"],
        ["四字熟語「堅忍不抜」の意味として正しいものはどれか。", ["どんな困難にも耐えて、心を動かさないこと", "かたくなに自分の考えを曲げないこと", "非常に用心深く行動すること", "力ずくで物事を押し通すこと"], "堅忍不抜（けんにんふばつ）は、意志が強く、困難に耐えてくじけないことです。"],
        ["四字熟語「一□千金」（わずかな時間がたいへん価値のあること）の□に入る漢字はどれか。", ["刻", "攫", "石", "日"], "一刻千金（いっこくせんきん）は、わずかな時間が千金にも値するほど貴重であることです。"],
        ["「凡庸」の対義語はどれか。", ["非凡", "平凡", "凡俗", "陳腐"], "平凡でとりえのない「凡庸」に対し、普通より特に優れていることが「非凡」です。"],
        ["「了解」の類義語はどれか。", ["承知", "拒否", "解決", "了見"], "事情をわかって受け入れるという意味で「了解」と「承知」は類義語です。"],
        ["「つぐなう」を漢字と送り仮名で正しく書いたものはどれか。", ["償う", "償なう", "賠う", "償ぐなう"], "「償」の訓読みは「つぐな（う）」なので、送り仮名は「う」です。"],
        ["熟語「贈賄」の構成として正しいものはどれか。", ["下の字が上の字の目的・対象を表す", "上の字が下の字を修飾する", "反対の意味の字を重ねる", "同じような意味の字を重ねる"], "「贈賄」は「賄（まいない）を贈る」で、下の字が上の字の目的を表す構成です。"]
    ]);

    // ===== 測量士・測量士補 =====
    const SURVEY_ASSISTANT_QUESTIONS = buildSet('測量士補', [
        ["測量法で「すべての測量の基礎となる測量」と定められている基本測量を行うのはどこか。", ["国土地理院", "国土交通省 地方整備局", "都道府県", "市町村"], "基本測量は、すべての測量の基礎となる測量で、国土地理院が行うものです（測量法第4条）。"],
        ["測量業を営もうとする者が登録を受けなければならない相手はどれか。", ["国土交通大臣", "国土地理院の長", "都道府県知事", "市町村長"], "測量業を営もうとする者は、国土交通大臣の行う登録を受けなければなりません（測量法第55条）。"],
        ["公共測量の作業規程の準則を定めるのはどれか。", ["国土交通大臣", "国土地理院の長", "総務大臣", "測量計画機関"], "国土交通大臣は、作業規程の準則を定めることができます（測量法第34条）。各計画機関はこれに基づいて作業規程を定めます。"],
        ["日本の測量で、地球の形状と大きさを表すために採用されている回転楕円体はどれか。", ["GRS80楕円体", "ベッセル楕円体", "WGS72楕円体", "クラーク楕円体"], "世界測地系（日本測地系2011）では GRS80 楕円体が採用されています。ベッセル楕円体は旧日本測地系のものです。"],
        ["日本の標高の基準はどれか。", ["東京湾平均海面", "相模湾平均海面", "大阪湾最低潮位", "日本海平均海面"], "標高は東京湾平均海面を基準とし、日本水準原点（東京都千代田区）がその基準点です。"],
        ["日本の平面直角座標系は、全国をいくつの系に分けているか。", ["19", "13", "16", "47"], "平面直角座標系は全国を19の系（座標系）に分け、ガウス・クリューゲル図法で投影しています。"],
        ["レベルを使った水準測量で、前視と後視の視準距離を等しくすることで消去できる誤差はどれか。", ["視準線（視準軸）誤差", "標尺の零点誤差", "標尺の目盛誤差", "標尺の傾きによる誤差"], "前視・後視の距離を等しくすると、視準線誤差や球差・気差の影響が打ち消されます。"],
        ["水準測量で、標尺の零点誤差を消去する方法として適切なものはどれか。", ["レベルの据付け回数（測点数）を偶数にする", "前視と後視の距離を等しくする", "標尺を2本とも同じ向きで使う", "観測を午前中だけ行う"], "据付け回数を偶数にすると、出発点と終点で同じ標尺を使うことになり、零点誤差が消去されます。"],
        ["トータルステーションの水平角観測で、望遠鏡の正・反の観測値を平均しても消去できない誤差はどれか。", ["鉛直軸誤差", "視準軸誤差", "水平軸誤差", "外心誤差"], "視準軸誤差・水平軸誤差・外心誤差は正反観測の平均で消去できますが、鉛直軸誤差は消去できません。"],
        ["GNSS測量で、2台以上の受信機で同時に観測し、観測点間の基線ベクトルを求める方法はどれか。", ["相対測位（干渉測位）", "単独測位", "DGPS（ディファレンシャル）だけを用いる方法", "トラバース測量"], "基準点測量で使う GNSS 測量は、複数の受信機で同時観測する相対測位（干渉測位）です。"],
        ["GNSS測量で、観測に使う衛星の配置の良し悪しを表す指標はどれか。", ["DOP（精度低下率）", "PCV", "SN比", "RINEX"], "DOP は衛星配置による精度の低下の度合いを表し、値が小さいほど配置がよいことを示します。"],
        ["GNSS測量で直接求められる高さと標高の関係として正しいものはどれか。", ["標高 ＝ 楕円体高 － ジオイド高", "標高 ＝ 楕円体高 ＋ ジオイド高", "標高 ＝ ジオイド高 － 楕円体高", "標高 ＝ 楕円体高"], "GNSSで求まるのは楕円体高です。ジオイド高を差し引いて標高を求めます。"],
        ["縮尺 1/25,000 の地形図上で 4 cm の長さは、実際の水平距離で何 m か。", ["1,000 m", "100 m", "250 m", "4,000 m"], "4 cm × 25,000 ＝ 100,000 cm ＝ 1,000 m です。"],
        ["縮尺 1/25,000 の地形図の主曲線の間隔はどれか。", ["10 m", "5 m", "20 m", "50 m"], "1/25,000 地形図の主曲線は 10 m ごと、計曲線は 50 m ごとです。"],
        ["焦点距離 15 cm のカメラで撮影高度 3,000 m から撮影した空中写真の縮尺はどれか（地表は平坦とする）。", ["1/20,000", "1/2,000", "1/45,000", "1/200,000"], "縮尺 ＝ 焦点距離 ÷ 撮影高度 ＝ 0.15 m ÷ 3,000 m ＝ 1/20,000 です。"],
        ["空中写真測量で、同一コースの隣り合う写真の重複度（オーバーラップ）の標準はどれか。", ["60%", "30%", "10%", "90%"], "実体視のため、同一コース内の重複度は60%、隣接コース間（サイドラップ）は30%が標準です。"],
        ["閉合トラバース（n 角形）の内角の和はどれか。", ["(n − 2) × 180°", "n × 180°", "(n + 2) × 180°", "n × 360°"], "多角形の内角の和は (n − 2) × 180° で、閉合比の点検に使います。"],
        ["路線測量で、曲線半径 R、交角 IA の単曲線の接線長 TL を求める式はどれか。", ["TL ＝ R × tan(IA/2)", "TL ＝ R × sin(IA/2)", "TL ＝ R × IA", "TL ＝ 2R × cos(IA/2)"], "接線長は TL ＝ R tan(IA/2)、曲線長は CL ＝ R × IA（ラジアン）です。"],
        ["測量士補試験の合格基準として正しいものはどれか（1問25点・28問）。", ["700点満点中450点以上", "700点満点中350点以上", "1,000点満点中600点以上", "28問中14問以上"], "測量士補試験は28問（各25点、700点満点）で、450点以上（18問以上正解）が合格基準です。"],
        ["地図の記号で、等高線の間隔が狭いところの地形はどれか。", ["傾斜が急である", "傾斜がゆるやかである", "平坦な土地である", "くぼ地である"], "等高線の間隔が狭いほど、短い水平距離で高さが大きく変わるので急傾斜です。"]
    ]);

    const SURVEYOR_QUESTIONS = buildSet('測量士', [
        ["基本測量の測量成果を使用して基本測量以外の測量を実施しようとする者が、あらかじめ得なければならないものはどれか。", ["国土地理院の長の承認", "国土交通大臣の許可", "都道府県知事の承認", "測量計画機関の同意"], "基本測量の測量成果を使用して測量を行うには、国土地理院の長の承認が必要です（測量法第30条）。"],
        ["公共測量を実施しようとする測量計画機関が、計画書を提出して技術的助言を求める相手はどれか。", ["国土地理院の長", "国土交通大臣", "都道府県知事", "測量業者"], "公共測量の実施計画書は国土地理院の長に提出し、技術的助言を求めます（測量法第36条）。"],
        ["測量士・測量士補となる資格を有する者が、測量士名簿・測量士補名簿への登録を申請する相手はどれか。", ["国土地理院の長", "国土交通大臣", "都道府県知事", "日本測量協会"], "登録は国土地理院の長に申請し、測量士名簿・測量士補名簿に登録されます（測量法第49条）。"],
        ["ジオイドの説明として正しいものはどれか。", ["平均海面を陸地の下まで延長したと考えた、重力の等ポテンシャル面", "地球の形を近似した回転楕円体の表面", "日本水準原点を通る水平面", "地表面の凹凸をそのまま表した面"], "ジオイドは平均海面に最もよく一致する等ポテンシャル面で、標高の基準面です。"],
        ["楕円体高が 80.0 m、ジオイド高が 36.0 m の点の標高はどれか。", ["44.0 m", "116.0 m", "36.0 m", "80.0 m"], "標高 ＝ 楕円体高 － ジオイド高 ＝ 80.0 － 36.0 ＝ 44.0 m です。"],
        ["GNSS測量で、電離層遅延の影響を軽減するのに有効な方法はどれか。", ["2周波で観測し、周波数による遅延の違いを利用して補正する", "観測時間を短くする", "衛星の仰角マスクをなくす", "受信機アンテナの高さを低くする"], "電離層遅延は周波数によって大きさが異なるため、2周波観測で補正できます。"],
        ["GNSS測量の「サイクルスリップ」の説明として正しいものはどれか。", ["受信が一時的に途切れ、搬送波位相の整数値（波数）が不連続になること", "衛星の時計の誤差", "アンテナ位相中心の変動", "反射波を受信することで生じる誤差"], "障害物などで信号が一時途切れると波数のカウントが飛びます。これをサイクルスリップといいます。4番目はマルチパスの説明です。"],
        ["同じ精度で n 回観測した値の平均値の標準偏差は、1回の観測の標準偏差の何倍か。", ["1/√n 倍", "1/n 倍", "√n 倍", "n 倍"], "等精度の観測値の平均値の標準偏差は σ/√n になります。"],
        ["水準測量の路線で、観測値の重みの考え方として正しいものはどれか。", ["路線距離に反比例する", "路線距離に比例する", "路線距離の2乗に比例する", "路線距離に関係しない"], "水準測量の誤差は路線距離に応じて大きくなるため、重みは路線距離に反比例させます。"],
        ["空中写真で、主点からの距離 r ＝ 60 mm の位置に写った比高 100 m の塔の、比高による像のずれ（倒れ）はどれか。撮影高度は 2,000 m とする。", ["3 mm", "6 mm", "0.3 mm", "30 mm"], "比高による像のずれ Δr ＝ r × h / H ＝ 60 × 100 / 2,000 ＝ 3 mm です。"],
        ["素子寸法 12 μm、焦点距離 120 mm のデジタル航空カメラで、撮影高度 2,000 m から撮影したときの地上画素寸法はどれか。", ["0.2 m", "0.02 m", "2 m", "0.12 m"], "地上画素寸法 ＝ 素子寸法 × 撮影高度 ÷ 焦点距離 ＝ 12×10⁻⁶ × 2,000 ÷ 0.12 ＝ 0.2 m です。"],
        ["航空レーザ測量で、航空機の位置と姿勢を求めるために使う機器の組み合わせはどれか。", ["GNSS と IMU（慣性計測装置）", "トータルステーションと レベル", "デジタルカメラと 光波測距儀", "磁気コンパスと 気圧高度計"], "GNSS で位置を、IMU で姿勢（傾き）を求め、レーザの測距結果と組み合わせて地表の三次元座標を求めます。"],
        ["平面直角座標系の原点（座標系原点）における縮尺係数はどれか。", ["0.9999", "1.0000", "0.9996", "1.0001"], "平面直角座標系の縮尺係数は原点で 0.9999 です。UTM 図法の中央子午線上の縮尺係数は 0.9996 です。"],
        ["光波測距儀で測定した距離の気象補正に必要な観測値の組み合わせはどれか。", ["気温と気圧", "風向と風速", "日射量と雲量", "降水量と湿度だけ"], "大気中の光の速さは気温・気圧（と湿度）で変わるため、これらを観測して気象補正を行います。"],
        ["路線測量のクロソイド曲線で、パラメータ A、曲線半径 R、曲線長 L の関係として正しいものはどれか。", ["A² ＝ R × L", "A ＝ R × L", "A² ＝ R ÷ L", "A ＝ R + L"], "クロソイド曲線は曲率が曲線長に比例して変化する曲線で、A² ＝ RL の関係があります。"],
        ["河川測量で、距離標を設置する間隔の標準はどれか。", ["河口から200 mごと", "河口から50 mごと", "河口から1 kmごと", "河口から2 kmごと"], "距離標は河心線に沿って河口（または幹川への合流点）から上流に向かって、200 mごとを標準として設置します。"],
        ["座標が A(0, 0)、B(30, 0)、C(20, 40)（単位 m）の三角形の面積はどれか。", ["600 m²", "1,200 m²", "300 m²", "800 m²"], "底辺 AB ＝ 30 m、高さ 40 m なので、面積は 30 × 40 ÷ 2 ＝ 600 m² です（座標法でも同じ）。"],
        ["断面積 20 m² と 30 m² の2つの横断面の間隔が 20 m のとき、平均断面法による土量はどれか。", ["500 m³", "1,000 m³", "250 m³", "600 m³"], "平均断面法：V ＝ (A₁ + A₂) ÷ 2 × L ＝ (20 + 30) ÷ 2 × 20 ＝ 500 m³ です。"],
        ["GIS のデータ形式のうち、ラスタデータの説明として正しいものはどれか。", ["格子状のセル（画素）ごとに値を持つ形式", "点・線・面の座標で図形を表す形式", "属性情報だけを表形式で持つ形式", "文字情報だけを持つ形式"], "ラスタデータは画像のようにセルの並びで表します。点・線・面で表すのはベクタデータです。"],
        ["測量士試験の合格基準として正しいものはどれか。", ["午前（択一）400点以上、かつ午前と午後の合計910点以上", "午前（択一）450点以上のみ", "午前と午後の合計700点以上", "午後（記述）のみで判定"], "測量士試験は午前の択一（700点満点）で400点以上、かつ午前と午後（記述、700点満点）の合計で910点以上が合格基準です。"]
    ]);

    // ===== 農業技術検定 =====
    const AGRI3_QUESTIONS = buildSet('農業技術検定3級', [
        ["肥料の三要素の組み合わせとして正しいものはどれか。", ["窒素・リン酸・カリ", "窒素・カルシウム・マグネシウム", "リン酸・鉄・マンガン", "カリ・ホウ素・硫黄"], "植物が多量に必要とし、不足しやすい窒素（N）・リン酸（P）・カリ（K）を肥料の三要素といいます。"],
        ["窒素が不足したときに作物に現れやすい症状はどれか。", ["下位の古い葉から黄色くなる", "新しい葉だけが紫色になる", "葉が濃い緑色になり茂りすぎる", "果実が大きくなりすぎる"], "窒素は体内を移動しやすいため、不足すると古い葉から黄化します。"],
        ["酸性になった土壌を中和するために施す資材として適切なものはどれか。", ["苦土石灰", "硫安", "過リン酸石灰", "ピートモス"], "苦土石灰（炭酸カルシウム・炭酸マグネシウム）はアルカリ性で、酸性土壌の改良に使います。"],
        ["土壌の団粒構造の利点として正しいものはどれか。", ["水もちと水はけ（通気性）の両方がよい", "水はけが悪く、水をためやすい", "肥料分を保持できない", "根が入りにくくなる"], "団粒の内部の小さなすき間に水を保ち、団粒間の大きなすき間で排水・通気が行われます。"],
        ["種子の発芽に必要な三つの条件の組み合わせはどれか。", ["水・温度・酸素", "水・光・肥料", "光・温度・二酸化炭素", "肥料・酸素・光"], "一般に、発芽には水分・適当な温度・酸素が必要です。光が必要かどうかは種類によります。"],
        ["発芽に光を必要とする好光性種子の作物はどれか。", ["レタス", "カボチャ", "ダイコン", "トマト"], "レタスやシソは好光性種子で、覆土を薄くします。カボチャ・ダイコン・トマトは嫌光性種子です。"],
        ["同じ畑に同じ作物を続けて作ることで生じる生育不良を何というか。", ["連作障害", "生理障害", "塩類集積", "徒長"], "連作により土壌病害や特定養分の不足などが起こることを連作障害といい、輪作などで防ぎます。"],
        ["連作障害を防ぐ方法として適切なものはどれか。", ["異なる科の作物を順番に作る輪作を行う", "同じ作物を毎年同じ場所に作る", "肥料を毎年2倍に増やす", "かん水を止める"], "科の異なる作物を組み合わせた輪作や、抵抗性台木への接ぎ木などで連作障害を防ぎます。"],
        ["ナス科の野菜はどれか。", ["ピーマン", "キュウリ", "ダイコン", "ホウレンソウ"], "ナス科にはトマト・ナス・ピーマン・ジャガイモなどがあります。キュウリはウリ科、ダイコンはアブラナ科です。"],
        ["キュウリをカボチャの台木に接ぎ木する主な目的はどれか。", ["土壌病害への抵抗性や低温での生育を高めるため", "果実をカボチャの味にするため", "種子を採りやすくするため", "収穫時期を遅らせるため"], "接ぎ木により、つる割病などの土壌病害への抵抗性や草勢を高めます。"],
        ["イネの受粉の仕方として正しいものはどれか。", ["主に自家受粉する", "主に虫が花粉を運ぶ", "雌雄異株で他家受粉する", "受粉せずに種子ができる"], "イネは開花とほぼ同時に同じ花の中で受粉する自殖性作物です。"],
        ["イネの穂が茎の中から出てくることを何というか。", ["出穂", "分げつ", "登熟", "活着"], "穂が出ることを出穂（しゅっすい）といいます。分げつは茎が枝分かれして増えること、登熟は実が充実することです。"],
        ["植物が光合成で吸収する気体はどれか。", ["二酸化炭素", "酸素", "窒素", "水素"], "光合成では二酸化炭素と水から、光のエネルギーを使って糖をつくり、酸素を放出します。"],
        ["害虫の天敵を利用して害虫を減らす防除方法はどれか。", ["生物的防除", "化学的防除", "物理的防除", "耕種的防除"], "天敵や微生物などの生物を利用する方法を生物的防除といいます。"],
        ["IPM（総合的病害虫・雑草管理）の考え方として正しいものはどれか。", ["さまざまな防除手段を組み合わせ、被害を経済的に問題のない水準に抑える", "農薬だけで病害虫を完全に根絶する", "病害虫が発生しても一切対策しない", "化学肥料の使用量を増やす"], "IPM は、耕種的・物理的・生物的・化学的防除を組み合わせ、環境への負荷を減らしながら被害を抑える考え方です。"],
        ["代表的な乳用牛の品種はどれか。", ["ホルスタイン種", "黒毛和種", "ランドレース種", "白色レグホーン種"], "ホルスタイン種は乳量の多い代表的な乳用種です。黒毛和種は肉用牛、ランドレース種は豚、白色レグホーン種は鶏です。"],
        ["牛の胃はいくつに分かれているか。", ["4つ", "1つ", "2つ", "3つ"], "牛は反すう動物で、第1胃（ルーメン）から第4胃までの4つの胃を持ちます。"],
        ["卵用鶏の代表的な品種はどれか。", ["白色レグホーン種", "ブロイラー", "名古屋種", "シャモ"], "白色レグホーン種は産卵能力の高い代表的な卵用種です。"],
        ["みその主な原料の組み合わせはどれか。", ["大豆・こうじ・食塩", "小麦・酵母・砂糖", "米・酢・食塩", "牛乳・乳酸菌・食塩"], "みそは大豆に米こうじ（または麦こうじ・豆こうじ）と食塩を加えて発酵・熟成させてつくります。"],
        ["農業の「6次産業化」の説明として正しいものはどれか。", ["生産（1次）・加工（2次）・販売（3次）を一体的に行い、付加価値を高めること", "農業を6つの部門に分けて分業すること", "6種類の作物を同時に栽培すること", "農業従事者を6倍に増やすこと"], "1次×2次×3次＝6次。農業者が加工・販売まで手がけ、所得の向上を目指す取り組みです。"]
    ]);

    const AGRI2_QUESTIONS = buildSet('農業技術検定2級', [
        ["土壌の陽イオン交換容量（CEC）の説明として正しいものはどれか。", ["土壌が陽イオン（養分）を吸着・保持できる量で、保肥力の目安となる", "土壌が保持できる水の量", "土壌の酸性の強さ", "土壌中の微生物の数"], "CEC が大きい土壌ほど、カルシウム・マグネシウム・カリウムなどの陽イオンを多く保持でき、保肥力が高くなります。"],
        ["土壌中で起こる「硝化作用」の説明として正しいものはどれか。", ["アンモニア態窒素が微生物の働きで硝酸態窒素に変わること", "硝酸態窒素が窒素ガスになって大気中に出ていくこと", "有機物が分解されてアンモニアが生じること", "空気中の窒素が根粒菌に固定されること"], "硝化は硝化菌によってアンモニア態窒素が亜硝酸を経て硝酸態窒素になる反応です。2番目は脱窒、3番目はアンモニア化成、4番目は窒素固定です。"],
        ["火山灰土壌（黒ボク土）でリン酸肥料が効きにくい主な理由はどれか。", ["リン酸がアルミニウムや鉄と結合して固定されやすいため", "雨でリン酸がすぐに流されるため", "土壌がアルカリ性すぎるため", "微生物がリン酸を分解するため"], "黒ボク土は活性アルミニウムが多く、リン酸を強く固定するため、リン酸の施用量を多くしたり、改良資材を使ったりします。"],
        ["C/N比（炭素率）の高い未熟な有機物を大量に施用したときに起こりやすい現象はどれか。", ["微生物が土壌中の窒素を取り込み、作物が窒素不足になる（窒素飢餓）", "窒素が過剰になり作物が徒長する", "土壌が急激にアルカリ化する", "土壌中の水分が急に増える"], "微生物が有機物を分解する際に土壌中の無機態窒素を使うため、一時的に作物の窒素が不足します。"],
        ["果実の成熟や落葉を促進する植物ホルモンはどれか。", ["エチレン", "ジベレリン", "オーキシン", "サイトカイニン"], "エチレンは気体の植物ホルモンで、果実の追熟などに関わります。"],
        ["種なしブドウの生産に利用される植物ホルモンはどれか。", ["ジベレリン", "エチレン", "アブシシン酸", "サイトカイニン"], "開花前後にジベレリン処理を行うことで、種なしで果粒の肥大した果実ができます。"],
        ["短日植物（日長が短くなると花芽をつける植物）はどれか。", ["キク", "ホウレンソウ", "ダイコン", "コムギ"], "キクやイネ・ダイズは短日植物です。ホウレンソウ・ダイコン・コムギは長日植物です。電照栽培でキクの開花時期を調節します。"],
        ["水稲の収量構成要素の組み合わせとして正しいものはどれか。", ["穂数 × 1穂籾数 × 登熟歩合 × 千粒重", "草丈 × 茎数 × 葉数 × 根数", "株数 × 葉面積 × 出穂日数 × 千粒重", "穂数 × 草丈 × 登熟日数 × 玄米色"], "単位面積あたりの収量は、穂数・1穂籾数・登熟歩合・千粒重の積で表されます。"],
        ["水稲栽培で行う「中干し」の主な目的はどれか。", ["無効分げつを抑え、土壌に酸素を供給して根を健全にする", "雑草の種子を発芽させる", "稲の草丈を大きく伸ばす", "肥料を水に溶かして流す"], "分げつが十分確保された頃に田の水を落として土を乾かし、過剰な分げつを抑え、根の活力を高めます。"],
        ["施設栽培で二酸化炭素を施用する主な目的はどれか。", ["光合成を促進して収量や品質を高める", "病害虫を死滅させる", "室温を下げる", "土壌のpHを上げる"], "閉め切ったハウス内では日中に二酸化炭素が不足しやすく、施用することで光合成が促進されます。"],
        ["うどんこ病の病原体として正しいものはどれか。", ["糸状菌（カビ）", "細菌", "ウイルス", "線虫"], "うどんこ病は糸状菌によって起こり、葉の表面が白い粉をまぶしたようになります。"],
        ["植物のウイルス病を媒介する害虫として代表的なものはどれか。", ["アブラムシ", "ナメクジ", "コガネムシの成虫", "ミミズ"], "アブラムシやアザミウマ、コナジラミなどは、吸汁の際にウイルスを伝搬します。"],
        ["農薬のラベルにある「収穫7日前まで」の意味として正しいものはどれか。", ["最後の散布から収穫まで7日以上あける必要がある", "収穫の7日後から散布できる", "7日ごとに散布する", "収穫7日前から毎日散布する"], "使用時期は、残留農薬が基準内に収まるよう定められています。表示を必ず守って使用します。"],
        ["牛の発情周期として正しいものはどれか。", ["約21日", "約7日", "約14日", "約40日"], "牛の発情周期は約21日です。発情の発見は人工授精を適期に行うために重要です。"],
        ["乳牛の乳房炎の説明として正しいものはどれか。", ["主に細菌の感染で乳房に炎症が起こり、乳中の体細胞数が増える", "乳の脂肪分が増える生理現象", "栄養不足で乳量が増える状態", "分娩前にだけ起こる正常な変化"], "乳房炎は酪農で最も多い疾病の一つで、乳質の低下や乳量の減少を招きます。搾乳衛生が予防の基本です。"],
        ["飼料の栄養価を表す TDN の意味はどれか。", ["可消化養分総量", "粗タンパク質", "乾物率", "代謝エネルギー"], "TDN（Total Digestible Nutrients）は、消化できる養分の総量で、飼料のエネルギー価の指標です。"],
        ["鶏卵の卵殻の主成分はどれか。", ["炭酸カルシウム", "リン酸カルシウム", "タンパク質", "ケイ酸"], "卵殻の主成分は炭酸カルシウムです。産卵鶏にはカルシウムを十分に給与します。"],
        ["減価償却の説明として正しいものはどれか。", ["機械や施設の取得費用を、耐用年数にわたって費用として配分すること", "機械を売却したときの利益", "農産物の値下がりによる損失", "借入金の利息"], "トラクターなど長く使う資産は、取得した年に全額を費用にせず、耐用年数に応じて毎年費用配分します。"],
        ["GAP の説明として正しいものはどれか。", ["農業生産工程管理。食品安全・環境保全・労働安全などの点検項目を定め、記録・改善する取り組み", "遺伝子組換え作物の表示制度", "農産物の価格安定制度", "肥料の成分表示の規格"], "GAP（Good Agricultural Practice）は、生産工程の管理によって持続可能な農業を実現する取り組みです。"],
        ["HACCP の説明として正しいものはどれか。", ["危害要因を分析し、重要管理点を継続的に監視・記録する衛生管理の手法", "最終製品の抜き取り検査だけで安全を確保する手法", "食品の栄養成分を表示する制度", "農産物の産地を証明する制度"], "HACCP は製造工程の中で危害を防ぐ重要な点を定めて管理する手法で、食品等事業者に導入が求められています。"]
    ]);

    // --- 網羅的マスター定義 ---
    const MASTER_EXAMS_CATALOG = [
        // 1. IT・情報系
        {
            id: 'itpass',
            passLine: 60,
            passNote: '総合評価 600/1000 点以上が基準',
            name: 'ITパスポート試験',
            category: 'IT・情報系',
            badge: '全20問収録',
            color: 'blue',
            icon: 'fa-laptop-code',
            desc: 'IT社会で働くすべての人が備えておきたい基礎的知識',
            questions: ITPASS_QUESTIONS
        },
        {
            id: 'fe',
            passLine: 60,
            passNote: '科目A・B 各 600/1000 点以上が基準',
            name: '基本情報技術者試験',
            category: 'IT・情報系',
            badge: '全20問収録',
            color: 'cyan',
            icon: 'fa-code',
            desc: 'ITエンジニアの登竜門。プログラミングやシステム構築の基礎',
            questions: FE_QUESTIONS
        },
        {
            id: 'ap',
            passLine: 60,
            passNote: '午前・午後 各 60% 以上が基準',
            name: '応用情報技術者試験',
            category: 'IT・情報系',
            badge: '全20問収録',
            color: 'indigo',
            icon: 'fa-microchip',
            desc: 'ワンランク上のIT人材。応用的なIT知識とシステム構築能力',
            questions: AP_QUESTIONS
        },

        // 2. 語学・国際系
        ...[
            ['eiken4', '4級', EIKEN4_QUESTIONS, '中学中級程度。基本的な語彙・文法、身近な会話'],
            ['eiken3', '3級', EIKEN3_QUESTIONS, '中学卒業程度。現在完了・受け身・関係代名詞など'],
            ['eikenp2', '準2級', EIKEN_P2_QUESTIONS, '高校中級程度。仮定法・分詞・熟語など日常生活に必要な英語'],
            ['eikenp2plus', '準2級プラス', EIKEN_P2PLUS_QUESTIONS, '2025年度に新設された、準2級と2級の間の級。社会的な話題も扱う'],
            ['eiken2', '2級', EIKEN2_QUESTIONS, '高校卒業程度。倒置・仮定法過去完了など社会生活に必要な英語']
        ].map(([id, level, questions, desc]) => ({
            id,
            group: 'eiken',
            groupName: '実用英語技能検定 (英検)',
            levelName: '級',
            levelLabel: level,
            passLine: 60,
            passNote: 'CSE スコアで判定され、正答率6割程度が合格の目安',
            name: `実用英語技能検定 ${level}`,
            category: '語学・国際',
            icon: 'fa-language',
            groupDesc: '語彙・文法・会話表現を級ごとに演習（筆記の語彙・文法問題形式）',
            desc,
            questions
        })),
        {
            id: 'toeic',
            passLine: 70,
            passNote: 'TOEIC に合否はないため目標の目安',
            name: 'TOEIC L&R',
            category: '語学・国際',
            badge: '全20問収録',
            color: 'teal',
            icon: 'fa-earth-americas',
            desc: 'グローバルビジネスで必要な英語コミュニケーション力',
            questions: TOEIC_QUESTIONS
        },

        // 3. ビジネス・会計・法律系
        {
            id: 'boki',
            passLine: 70,
            passNote: '2・3級は 70 点以上が基準',
            name: '日商簿記検定',
            category: 'ビジネス・会計・法律',
            badge: '全20問収録',
            color: 'amber',
            icon: 'fa-calculator',
            desc: '企業の財務・会計知識、決算書読解力の証明',
            questions: BOKI_QUESTIONS
        },
        {
            id: 'fp',
            passLine: 60,
            passNote: '3級学科は 60% 以上が基準',
            name: 'FP (ファイナンシャル・プランナー)',
            category: 'ビジネス・会計・法律',
            badge: '全20問収録',
            color: 'emerald',
            icon: 'fa-coins',
            desc: '税金・投資・保険・不動産・年金などのお金に関する総合知識',
            questions: FP_QUESTIONS
        },
        {
            id: 'takken',
            passLine: 70,
            passNote: '合格点は年度により変動（例年 70% 前後）',
            name: '宅地建物取引士 (宅建)',
            category: 'ビジネス・会計・法律',
            badge: '全20問収録',
            color: 'orange',
            icon: 'fa-house-chimney-window',
            desc: '不動産取引の専門家。契約重要事項説明などの必須国家資格',
            questions: TAKKEN_QUESTIONS
        },

        // 4. 教養・学術・デザイン・その他
        // group が同じ検定は1枚のカードにまとめ、級（区分）を選んで演習する
        ...[
            ['kanken4', '4級', 70, '200点満点で140点程度（70%）が目安', KANKEN4_QUESTIONS, '中学校在学程度。常用漢字のうち約1,300字の読み書き'],
            ['kanken3', '3級', 70, '200点満点で140点程度（70%）が目安', KANKEN3_QUESTIONS, '中学校卒業程度。常用漢字のうち約1,600字の読み書き'],
            ['kankenp2', '準2級', 70, '200点満点で140点程度（70%）が目安', KANKEN_P2_QUESTIONS, '高校在学程度。常用漢字のうち約1,950字の読み書き'],
            ['kanken2', '2級', 80, '200点満点で160点程度（80%）が目安', KANKEN2_QUESTIONS, '高校卒業・大学・一般程度。常用漢字すべての読み書き']
        ].map(([id, level, passLine, passNote, questions, desc]) => ({
            id,
            group: 'kanken',
            groupName: '日本漢字能力検定 (漢検)',
            levelName: '級',
            levelLabel: level,
            passLine,
            passNote,
            name: `日本漢字能力検定 ${level}`,
            category: '教養・学術・その他',
            icon: 'fa-pen-nib',
            groupDesc: '漢字の読み書き、部首、四字熟語、対義語・類義語などを級ごとに演習',
            desc,
            questions
        })),

        // 5. 農業・測量・技術
        ...[
            ['survey-assistant', '測量士補', 65, '28問（各25点、700点満点）で450点以上が基準', SURVEY_ASSISTANT_QUESTIONS, '測量法・基準点測量・水準測量・GNSS・地形測量・写真測量・応用測量の基礎'],
            ['surveyor', '測量士', 65, '午前（択一）400/700点以上、かつ午前と午後の合計910/1400点以上が基準', SURVEYOR_QUESTIONS, '測量士補より高度な測量法規、誤差論、GNSS、写真・レーザ測量、応用測量']
        ].map(([id, level, passLine, passNote, questions, desc]) => ({
            id,
            group: 'survey',
            groupName: '測量士・測量士補',
            levelName: '区分',
            levelLabel: level,
            passLine,
            passNote,
            name: level,
            category: '農業・測量・技術',
            icon: 'fa-map-location-dot',
            groupDesc: '測量の国家資格。測量法規から基準点・水準・写真測量まで',
            desc,
            questions
        })),
        ...[
            ['agri3', '3級', 60, '100点満点で60点以上が目安（年度により補正あり）', AGRI3_QUESTIONS, '農業高校生などの基礎レベル。農業基礎・栽培・畜産・食品の基本'],
            ['agri2', '2級', 60, '学科試験は60%程度が目安（年度により補正あり）', AGRI2_QUESTIONS, '農業の専門的な知識。土壌肥料・作物生理・病害虫・家畜・経営']
        ].map(([id, level, passLine, passNote, questions, desc]) => ({
            id,
            group: 'agri',
            groupName: '日本農業技術検定',
            levelName: '級',
            levelLabel: level,
            passLine,
            passNote,
            name: `日本農業技術検定 ${level}`,
            category: '農業・測量・技術',
            icon: 'fa-seedling',
            groupDesc: '農業の知識・技術を評価する検定。栽培・畜産・食品・環境など',
            desc,
            questions
        }))
    ];

    // 学習記録・復習用に、各問題へ安定した ID（「検定ID-番号」）を付ける
    // ※ 並び順が変わると ID も変わるため、問題を追加するときは各セットの末尾に追加すること
    MASTER_EXAMS_CATALOG.forEach(ex => {
        ex.questions = ex.questions.map((q, i) => ({ ...q, title: stripTitlePrefix(q.title), qid: `${ex.id}-${i + 1}`, examId: ex.id }));
        ex.badge = `全${ex.questions.length}問収録`;
    });

    window.QualiQData = Object.freeze({ MASTER_EXAMS_CATALOG, stripTitlePrefix });
})();

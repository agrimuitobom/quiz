// 画面描画前にテーマを適用してちらつきを防ぐ（'system' | 'light' | 'dark'）
(function () {
    var pref = 'system';
    try { pref = localStorage.getItem('quailq:theme') || 'system'; } catch (e) {}
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
})();

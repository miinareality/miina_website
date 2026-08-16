(() => {
    const STORAGE_KEY = "miina_memo";
    const memo = document.getElementById("memo");
    const status = document.getElementById("memo-status");
    const save = document.getElementById("save-memo");
    const clear = document.getElementById("clear-memo");

    if (!memo) return;

    const setStatus = (text) => {
        if (status) status.textContent = text;
    };

    try {
        memo.value = localStorage.getItem(STORAGE_KEY) || "";
        setStatus("読み込み完了");
    } catch (error) {
        console.error("LocalStorage read error:", error);
        setStatus("保存データを読み込めませんでした");
    }

    const saveMemo = () => {
        try {
            localStorage.setItem(STORAGE_KEY, memo.value);
            setStatus("保存しました");
        } catch (error) {
            console.error("LocalStorage write error:", error);
            setStatus("保存できませんでした");
        }
    };

    save?.addEventListener("click", saveMemo);

    // Inputごとに自動保存。ボタン保存も残してあります。
    memo.addEventListener("input", () => {
        try {
            localStorage.setItem(STORAGE_KEY, memo.value);
            setStatus("自動保存中");
        } catch (error) {
            console.error("LocalStorage auto-save error:", error);
        }
    });

    clear?.addEventListener("click", () => {
        if (!confirm("メモを削除しますか？")) return;
        memo.value = "";
        try {
            localStorage.removeItem(STORAGE_KEY);
            setStatus("メモを削除しました");
        } catch (error) {
            console.error("LocalStorage remove error:", error);
        }
    });
})();

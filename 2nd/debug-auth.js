/* debug-auth.js
   debug.html 専用のアカウント状態表示。
   ログイン画面そのものは 2nd/login.html にあります。
*/

document.addEventListener("DOMContentLoaded", async () => {
    const statusElement = document.getElementById("account-status-content");
    if (!statusElement) return;

    const renderStatus = (session) => {
        statusElement.replaceChildren();

        const state = document.createElement("div");
        state.innerHTML = session?.user ? "🔐 <strong>ログイン中</strong>" : "🔓 <strong>未ログイン</strong>";
        statusElement.appendChild(state);

        if (session?.user) {
            const email = document.createElement("div");
            email.style.marginTop = "8px";
            email.appendChild(document.createElement("strong")).textContent = "メールアドレス";
            email.appendChild(document.createElement("br"));
            email.appendChild(document.createTextNode(session.user.email || "未設定"));
            statusElement.appendChild(email);

            const userId = document.createElement("div");
            userId.style.marginTop = "8px";
            userId.appendChild(document.createElement("strong")).textContent = "ユーザーID";
            userId.appendChild(document.createElement("br"));
            userId.appendChild(document.createTextNode(session.user.id || "未設定"));
            statusElement.appendChild(userId);

            const authState = document.createElement("div");
            authState.style.marginTop = "8px";
            authState.appendChild(document.createElement("strong")).textContent = "認証状態";
            authState.appendChild(document.createElement("br"));
            authState.appendChild(document.createTextNode("正常"));
            statusElement.appendChild(authState);
        } else {
            const message = document.createElement("div");
            message.style.marginTop = "8px";
            message.textContent = "現在ログインしていません。";
            statusElement.appendChild(message);

            const login = document.createElement("div");
            login.style.marginTop = "10px";
            const link = document.createElement("a");
            link.href = "2nd/login.html";
            link.textContent = "ログイン";
            login.appendChild(link);
            statusElement.appendChild(login);
        }
    };

    try {
        await MiinaAuth.initializeSupabase();
        renderStatus(await MiinaAuth.getCurrentSession());

        const subscription = await MiinaAuth.watchAuthState((_event, session) => {
            renderStatus(session);
        });

        window.addEventListener("pagehide", () => {
            subscription?.unsubscribe?.();
        }, { once: true });
    } catch (error) {
        console.error("Debug authentication status error:", error);
        statusElement.textContent = "認証状態を取得できませんでした。";
    }
});

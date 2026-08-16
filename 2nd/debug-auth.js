/* debug-auth.js
   Login/authentication UI is intentionally enabled only on debug.html.
*/
document.addEventListener("DOMContentLoaded", async () => {
    const status = document.getElementById("account-status");
    const loginButton = document.getElementById("debug-login-button");
    const logoutButton = document.getElementById("debug-logout-button");
    const accountEmail = document.getElementById("debug-account-email");

    const render = (session) => {
        if (status) {
            status.textContent = session?.user
                ? `ログイン中：${session.user.email || "ユーザー"}`
                : "未ログイン";
        }
        if (accountEmail) {
            accountEmail.textContent = session?.user?.email || "未ログイン";
        }
        if (loginButton) loginButton.style.display = session?.user ? "none" : "";
        if (logoutButton) logoutButton.style.display = session?.user ? "" : "none";
    };

    try {
        const session = await MiinaAuth.getCurrentSession();
        render(session);

        await MiinaAuth.onAuthStateChange((_event, session) => render(session));
    } catch (error) {
        console.error(error);
        render(null);
    }

    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const email = prompt("メールアドレスを入力してください");
            if (!email) return;
            const password = prompt("パスワードを入力してください");
            if (!password) return;

            try {
                await MiinaAuth.signIn(email, password);
                alert("ログインしました。");
            } catch (error) {
                alert(MiinaAuth.formatAuthError(error));
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await MiinaAuth.signOut();
                alert("ログアウトしました。");
            } catch (error) {
                alert(MiinaAuth.formatAuthError(error));
            }
        });
    }
});

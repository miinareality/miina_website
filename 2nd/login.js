/* login.js
   login.html 専用の認証UI処理。
   公開ページにはログインUIを追加しません。
*/

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const signupButton = document.getElementById("signupButton");
    const message = document.getElementById("authMessage");

    const showMessage = (text, isError = false) => {
        if (!message) return;
        message.textContent = text;
        message.style.color = isError ? "#d00" : "";
    };

    const setButtonsDisabled = (disabled) => {
        if (loginButton) loginButton.disabled = disabled;
        if (signupButton) signupButton.disabled = disabled;
    };

    try {
        await MiinaAuth.initializeSupabase();
    } catch (error) {
        console.error("Supabase initialization error:", error);
        showMessage("Supabaseとの接続準備に失敗しました。ページを再読み込みしてください。", true);
        return;
    }

    try {
        const session = await MiinaAuth.getCurrentSession();
        if (session?.user) {
            showMessage(`現在ログイン中です：${session.user.email || "ユーザー"}`);
        }
    } catch (error) {
        console.error("Session check error:", error);
    }

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMessage("メールアドレスとパスワードを入力してください。", true);
            return;
        }

        setButtonsDisabled(true);
        showMessage("ログインしています……");

        try {
            const result = await MiinaAuth.signIn(email, password);
            console.log("ログイン成功:", result.user);
            showMessage("ログインしました。debug.htmlへ移動します。");

            setTimeout(() => {
                window.location.href = "../debug.html";
            }, 500);
        } catch (error) {
            showMessage(MiinaAuth.getAuthErrorMessage(error), true);
        } finally {
            setButtonsDisabled(false);
        }
    });

    signupButton?.addEventListener("click", async () => {
        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMessage("メールアドレスとパスワードを入力してください。", true);
            return;
        }

        setButtonsDisabled(true);
        showMessage("アカウントを作成しています……");

        try {
            const result = await MiinaAuth.signUp(email, password);
            if (result?.session?.user) {
                showMessage("アカウントを作成し、ログインしました。debug.htmlへ移動します。");
                setTimeout(() => {
                    window.location.href = "../debug.html";
                }, 500);
            } else {
                showMessage("アカウントを作成しました。必要な場合はメールアドレスを確認してからログインしてください。");
            }
        } catch (error) {
            showMessage(MiinaAuth.getAuthErrorMessage(error), true);
        } finally {
            setButtonsDisabled(false);
        }
    });
});

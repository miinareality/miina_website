/* login.js
   login.html 専用の認証UI処理
   公開ページのメニュー等にはログインUIを追加しません。
*/

document.addEventListener("DOMContentLoaded", async () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const signupButton = document.getElementById("signupButton");
    const message = document.getElementById("authMessage");

    const showMessage = (text, isError = false) => {
        if (!message) return;
        message.textContent = text;
        message.style.color = isError ? "red" : "";
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

    // すでにログイン済みなら現在の状態を表示します。
    try {
        const session = await MiinaAuth.getCurrentSession();
        if (session?.user) {
            showMessage(`現在ログイン中です：${session.user.email || "ユーザー"}`);
        }
    } catch (error) {
        console.error("Session check error:", error);
    }

    loginButton?.addEventListener("click", async () => {
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

            // 現段階ではログイン機能の確認場所をdebug.htmlに限定します。
            setTimeout(() => {
                window.location.href = "../debug.html";
            }, 700);
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
            await MiinaAuth.signUp(email, password);
            showMessage("アカウントを作成しました。ログインをお試しください。");
        } catch (error) {
            showMessage(MiinaAuth.getAuthErrorMessage(error), true);
        } finally {
            setButtonsDisabled(false);
        }
    });
});

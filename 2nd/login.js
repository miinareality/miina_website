/* login.js - login.html only */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const signupEmail = document.getElementById("signup-email");
    const signupPassword = document.getElementById("signup-password");
    const message = document.getElementById("login-message");
    const resendButton = document.getElementById("resend-confirmation");

    let lastSignupEmail = "";

    const showMessage = (text, type = "") => {
        if (!message) return;
        message.textContent = text;
        message.className = type ? `login-message ${type}` : "login-message";
    };

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = loginEmail?.value.trim() || "";
        const password = loginPassword?.value || "";

        if (!email || !password) {
            showMessage("メールアドレスとパスワードを入力してください。", "error");
            return;
        }

        showMessage("ログインしています…");

        try {
            await MiinaAuth.signIn(email, password);
            showMessage("ログインしました。");
            window.location.href = "../debug.html";
        } catch (error) {
            console.error(error);
            showMessage(MiinaAuth.formatAuthError(error), "error");

            if (/email not confirmed/i.test(error?.message || "")) {
                lastSignupEmail = email;
                if (resendButton) resendButton.hidden = false;
            }
        }
    });

    signupForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = signupEmail?.value.trim() || "";
        const password = signupPassword?.value || "";

        if (!email || !password) {
            showMessage("メールアドレスとパスワードを入力してください。", "error");
            return;
        }

        showMessage("アカウントを作成しています…");

        try {
            const data = await MiinaAuth.signUp(email, password);
            lastSignupEmail = email;

            // Confirm Emailが有効なら通常ここではsessionが発行されない。
            if (!data.session) {
                showMessage(
                    "アカウントを作成しました。登録したメールアドレスに確認メールを送信しました。メール内のリンクを押して認証を完了してください。",
                    "success"
                );
                if (resendButton) resendButton.hidden = false;
            } else {
                // Supabase側でConfirm EmailがOFFの場合の保険。
                showMessage("アカウントを作成しました。", "success");
            }
        } catch (error) {
            console.error(error);
            showMessage(MiinaAuth.formatAuthError(error), "error");
        }
    });

    resendButton?.addEventListener("click", async () => {
        const email = lastSignupEmail || signupEmail?.value.trim() || loginEmail?.value.trim() || "";

        if (!email) {
            showMessage("確認メールを再送するメールアドレスを入力してください。", "error");
            return;
        }

        showMessage("確認メールを再送しています…");

        try {
            await MiinaAuth.resendSignupConfirmation(email);
            showMessage("確認メールを再送しました。メールをご確認ください。", "success");
        } catch (error) {
            console.error(error);
            showMessage(MiinaAuth.formatAuthError(error), "error");
        }
    });
});

/* Supabase 認証
   2nd/auth.js */


/* Supabase設定 */

// SupabaseのプロジェクトURL
const SUPABASE_URL = "https://xbactiinrfyjdixdlquq.supabase.co";

// Supabaseの「公開可能なキー」をここに貼り付ける
// sb_publishable_... から始まるキーを使用してください。
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_suDqy2nOQ2nd616qIhR2hg_sX-_2Anc";


/* Supabaseライブラリを読み込む */

const supabaseScript = document.createElement("script");

supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload = function () {
    initializeSupabase();
};

supabaseScript.onerror = function () {
    console.error("Supabaseライブラリの読み込みに失敗しました。");
    showAuthMessage(
        "Supabaseとの接続準備に失敗しました。",
        true
    );
};

document.head.appendChild(supabaseScript);


/* Supabase初期化 */

let supabaseClient = null;

function initializeSupabase() {

    if (
        SUPABASE_PUBLISHABLE_KEY ===
        "ここにsb_publishable_から始まるキーを入れる"
    ) {
        console.warn(
            "SupabaseのPublishable Keyが設定されていません。"
        );

        showAuthMessage(
            "Supabaseの公開可能なキーがまだ設定されていません。",
            true
        );

        return;
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log("Supabaseの初期化が完了しました。");

    setupAuthEvents();
    checkLoginState();
}


/* メッセージ表示 */

function showAuthMessage(message, isError = false) {

    const messageElement =
        document.getElementById("authMessage");

    if (!messageElement) {
        console.log(message);
        return;
    }

    messageElement.textContent = message;

    if (isError) {
        messageElement.style.color = "red";
    } else {
        messageElement.style.color = "";
    }
}


/* ログイン・新規登録ボタン */

function setupAuthEvents() {

    const loginButton =
        document.getElementById("loginButton");

    const signupButton =
        document.getElementById("signupButton");


    /* ログイン */

    if (loginButton) {

        loginButton.addEventListener("click", async function () {

            if (!supabaseClient) {
                showAuthMessage(
                    "Supabaseの準備が完了していません。",
                    true
                );
                return;
            }

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;


            if (!email || !password) {
                showAuthMessage(
                    "メールアドレスとパスワードを入力してください。",
                    true
                );
                return;
            }


            loginButton.disabled = true;

            showAuthMessage("ログインしています……");


            try {

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });


                if (error) {
                    throw error;
                }


                console.log(
                    "ログイン成功:",
                    data.user
                );


                showAuthMessage(
                    "ログインしました。index.htmlへ移動します。"
                );


                /*
                 * 少し待ってからdebug.htmlへ移動
                 */
                setTimeout(function () {

                    window.location.href = "../index.html";

                }, 800);


            } catch (error) {

                console.error(
                    "ログインエラー:",
                    error
                );

                showAuthMessage(
                    getAuthErrorMessage(error),
                    true
                );

            } finally {

                loginButton.disabled = false;

            }

        });

    }


    /* 新規登録 */

    if (signupButton) {

        signupButton.addEventListener("click", async function () {

            if (!supabaseClient) {
                showAuthMessage(
                    "Supabaseの準備が完了していません。",
                    true
                );
                return;
            }

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;


            if (!email || !password) {
                showAuthMessage(
                    "メールアドレスとパスワードを入力してください。",
                    true
                );
                return;
            }


            if (password.length < 6) {
                showAuthMessage(
                    "パスワードは6文字以上にしてください。",
                    true
                );
                return;
            }


            signupButton.disabled = true;

            showAuthMessage(
                "アカウントを作成しています……"
            );


            try {

                const { data, error } =
                    await supabaseClient.auth.signUp({
                        email: email,
                        password: password
                    });


                if (error) {
                    throw error;
                }


                console.log(
                    "新規登録成功:",
                    data.user
                );


                /*
                 * 今回はSupabase側で
                 * Confirm emailをOFFにしているため、
                 * 登録後すぐにログインできる想定。
                 */

                showAuthMessage(
                    "アカウントを作成しました。ログインを試してください。"
                );


            } catch (error) {

                console.error(
                    "新規登録エラー:",
                    error
                );

                showAuthMessage(
                    getAuthErrorMessage(error),
                    true
                );

            } finally {

                signupButton.disabled = false;

            }

        });

    }


    /* -----------------------------
       ログイン状態の変化を監視
       ----------------------------- */

    supabaseClient.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "認証状態が変化しました:",
                event
            );

            if (session && session.user) {

                console.log(
                    "ログイン中のユーザー:",
                    session.user.email
                );

            }

        }
    );

}


/* ========================================
   ログイン状態を確認
   ======================================== */

async function checkLoginState() {

    if (!supabaseClient) {
        return;
    }


    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();


        if (session && session.user) {

            console.log(
                "現在ログインしています:",
                session.user.email
            );

            showAuthMessage(
                "現在ログイン中です：" +
                session.user.email
            );

        } else {

            console.log(
                "現在ログインしているユーザーはいません。"
            );

        }

    } catch (error) {

        console.error(
            "ログイン状態の確認に失敗しました:",
            error
        );

    }

}


/* ========================================
   ログアウト
   ======================================== */

async function logout() {

    if (!supabaseClient) {
        console.error(
            "Supabaseが初期化されていません。"
        );
        return;
    }


    try {

        const { error } =
            await supabaseClient.auth.signOut();


        if (error) {
            throw error;
        }


        console.log("ログアウトしました。");


        showAuthMessage(
            "ログアウトしました。"
        );


    } catch (error) {

        console.error(
            "ログアウトエラー:",
            error
        );

        showAuthMessage(
            getAuthErrorMessage(error),
            true
        );

    }

}


/* ========================================
   Supabaseエラーを日本語に変換
   ======================================== */

function getAuthErrorMessage(error) {

    if (!error) {
        return "不明なエラーが発生しました。";
    }


    const message =
        error.message || "";


    /* ログイン関連 */

    if (
        message.includes("Invalid login credentials")
    ) {
        return "メールアドレスまたはパスワードが正しくありません。";
    }


    /* 既に登録済み */

    if (
        message.includes("User already registered")
    ) {
        return "このメールアドレスはすでに登録されています。";
    }


    /* パスワード */

    if (
        message.includes("Password should be at least")
    ) {
        return "パスワードが短すぎます。";
    }


    /* メールアドレス */

    if (
        message.includes("Invalid email")
    ) {
        return "メールアドレスの形式が正しくありません。";
    }


    /* レート制限 */

    if (
        message.includes("rate limit") ||
        message.includes("Too many requests")
    ) {
        return "操作回数が多すぎます。少し待ってからもう一度お試しください。";
    }


    /* その他 */

    return "エラーが発生しました：" + message;

}

/* =========================================================
   auth.js
   Supabase authentication core.
   Email confirmation is required by the Supabase project setting.
   Visible login UI is intentionally NOT created here.
   ========================================================= */

const SUPABASE_URL = 'https://xbactiinrfyjdixdlquq.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const AUTH_REDIRECT_URL = 'https://miinareality.github.io/miina_website/2nd/login.html';

let supabaseClient = null;

function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase && window.supabase.createClient) {
            resolve(window.supabase);
            return;
        }

        const existing = document.querySelector('script[data-supabase-client="true"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.supabase), { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.dataset.supabaseClient = "true";
        script.onload = () => resolve(window.supabase);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initializeSupabase() {
    if (supabaseClient) return supabaseClient;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY ||
        SUPABASE_URL.includes("YOUR_SUPABASE") ||
        SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")) {
        throw new Error("Supabaseの接続設定が未設定です。");
    }

    const lib = await loadSupabase();
    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

async function getCurrentSession() {
    const client = await initializeSupabase();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
}

async function signIn(email, password) {
    const client = await initializeSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function signUp(email, password) {
    const client = await initializeSupabase();

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: AUTH_REDIRECT_URL
        }
    });

    if (error) throw error;
    return data;
}

async function resendSignupConfirmation(email) {
    const client = await initializeSupabase();

    const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: {
            emailRedirectTo: AUTH_REDIRECT_URL
        }
    });

    if (error) throw error;
}

async function signOut() {
    const client = await initializeSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
}

async function onAuthStateChange(callback) {
    const client = await initializeSupabase();
    return client.auth.onAuthStateChange((event, session) => {
        try {
            callback(event, session);
        } catch (error) {
            console.error("Auth callback error:", error);
        }
    });
}

function formatAuthError(error) {
    const message = error?.message || "";

    if (/invalid login credentials/i.test(message)) {
        return "メールアドレスまたはパスワードが正しくありません。";
    }

    if (/email not confirmed/i.test(message)) {
        return "メールアドレスの認証が完了していません。確認メールをご確認ください。";
    }

    if (/already registered|already exists/i.test(message)) {
        return "このメールアドレスはすでに登録されている可能性があります。";
    }

    if (/password/i.test(message) && /short|length|characters/i.test(message)) {
        return "パスワードの条件を確認してください。";
    }

    return "認証処理でエラーが発生しました。しばらくしてからもう一度お試しください。";
}

window.MiinaAuth = {
    initializeSupabase,
    getCurrentSession,
    signIn,
    signUp,
    resendSignupConfirmation,
    signOut,
    onAuthStateChange,
    formatAuthError
};

/* =========================================================
   auth.js
   Supabase authentication core.
   This file intentionally does NOT create visible login UI.
   debug.html can opt into the debug status display.
   ========================================================= */

const SUPABASE_URL = "https://xbactiinrfyjdixdlquq.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;
let authInitialized = false;

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
        console.warn("Supabase settings are not configured in auth.js.");
        return null;
    }

    const lib = await loadSupabase();
    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    authInitialized = true;
    return supabaseClient;
}

async function getCurrentSession() {
    const client = await initializeSupabase();
    if (!client) return null;

    const { data, error } = await client.auth.getSession();
    if (error) {
        console.error("getSession error:", error);
        return null;
    }
    return data.session;
}

function formatAuthError(error) {
    const message = error?.message || "";
    if (/invalid login credentials/i.test(message)) return "メールアドレスまたはパスワードが正しくありません。";
    if (/email not confirmed/i.test(message)) return "メールアドレスの確認が必要です。";
    if (/password/i.test(message) && /short|length|characters/i.test(message)) return "パスワードの条件を確認してください。";
    if (/already registered|already exists/i.test(message)) return "このメールアドレスはすでに登録されています。";
    return "認証処理でエラーが発生しました。しばらくしてからもう一度お試しください。";
}

async function signIn(email, password) {
    const client = await initializeSupabase();
    if (!client) throw new Error("Supabaseが設定されていません。");

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function signUp(email, password) {
    const client = await initializeSupabase();
    if (!client) throw new Error("Supabaseが設定されていません。");

    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

async function signOut() {
    const client = await initializeSupabase();
    if (!client) return;

    const { error } = await client.auth.signOut();
    if (error) throw error;
}

async function onAuthStateChange(callback) {
    const client = await initializeSupabase();
    if (!client) return null;

    return client.auth.onAuthStateChange((event, session) => {
        try {
            callback(event, session);
        } catch (error) {
            console.error("Auth callback error:", error);
        }
    });
}

window.MiinaAuth = {
    initializeSupabase,
    getCurrentSession,
    signIn,
    signUp,
    signOut,
    onAuthStateChange,
    formatAuthError
};

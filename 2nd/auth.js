/* =========================================================
   auth.js
   Supabase authentication core

   認証UIはここには置きません。
   login.html / debug.html など各ページ側のJSから呼び出します。
   ========================================================= */

const SUPABASE_URL = "https://xbactiinrfyjdixdlquq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_suDqy2nOQ2nd616qIhR2hg_sX-_2Anc";

let supabaseClient = null;
let supabaseLoadPromise = null;

function loadSupabase() {
    if (window.supabase?.createClient) {
        return Promise.resolve(window.supabase);
    }

    if (supabaseLoadPromise) return supabaseLoadPromise;

    supabaseLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-miina-supabase="true"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.supabase), { once: true });
            existing.addEventListener("error", () => reject(new Error("Supabaseライブラリの読み込みに失敗しました。")), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.dataset.miinaSupabase = "true";
        script.onload = () => {
            if (window.supabase?.createClient) {
                resolve(window.supabase);
            } else {
                reject(new Error("Supabaseライブラリを利用できません。"));
            }
        };
        script.onerror = () => reject(new Error("Supabaseライブラリの読み込みに失敗しました。"));
        document.head.appendChild(script);
    });

    return supabaseLoadPromise;
}

async function initializeSupabase() {
    if (supabaseClient) return supabaseClient;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        throw new Error("Supabaseの設定がありません。");
    }

    const lib = await loadSupabase();
    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
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
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

async function signOut() {
    const client = await initializeSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
}

async function watchAuthState(callback) {
    const client = await initializeSupabase();
    const { data } = client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
    return data.subscription;
}

function getAuthErrorMessage(error) {
    const message = error?.message || "";

    if (/invalid login credentials/i.test(message)) {
        return "メールアドレスまたはパスワードが正しくありません。";
    }
    if (/email not confirmed/i.test(message)) {
        return "メールアドレスの確認が必要です。Supabaseのメール設定も確認してください。";
    }
    if (/already registered|user already registered/i.test(message)) {
        return "このメールアドレスはすでに登録されています。";
    }
    if (/password/i.test(message) && /short|characters|length/i.test(message)) {
        return "パスワードの条件を確認してください。";
    }

    console.error("Supabase authentication error:", error);
    return "認証処理でエラーが発生しました。しばらくしてからもう一度お試しください。";
}

window.MiinaAuth = {
    initializeSupabase,
    getCurrentSession,
    signIn,
    signUp,
    signOut,
    watchAuthState,
    getAuthErrorMessage
};

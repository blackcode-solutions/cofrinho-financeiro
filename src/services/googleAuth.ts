import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { isSupabaseConfigured, supabase } from './supabase';

// Requires Google provider enabled in Supabase Dashboard + OAuth client in Google Cloud Console.
// App redirect: cofrinhofinanceiro:// (add to Supabase Auth redirect URLs).

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'cofrinhofinanceiro' });

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token, code } = params;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  if (!access_token) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
  if (error) throw error;
  return data.session;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error('Login com Google exige Supabase configurado no .env');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Não foi possível iniciar o login com Google');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    throw new Error('Login com Google cancelado');
  }

  const session = await createSessionFromUrl(result.url);
  if (!session?.user) throw new Error('Sessão Google inválida');
  return { userId: session.user.id, session };
}

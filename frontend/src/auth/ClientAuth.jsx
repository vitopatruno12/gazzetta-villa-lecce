import { createContext, useContext, useMemo, useState } from 'react';

const TOKEN_KEY = 'gazzetta_client_token';
const USER_KEY = 'gazzetta_client_user';

const ClientAuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clientToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function ClientAuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const value = useMemo(
    () => ({
      user,
      login(session) {
        localStorage.setItem(TOKEN_KEY, session.token);
        localStorage.setItem(USER_KEY, JSON.stringify(session.user));
        setUser(session.user);
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [user]
  );

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}

export function useClientAuth() {
  return useContext(ClientAuthContext);
}

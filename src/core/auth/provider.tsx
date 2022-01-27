import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../index";
import { login as loginApi } from "./api";
import { Storage } from "@capacitor/storage";
import { useImmer } from "use-immer";

const log = getLogger("AuthProvider");

type LoginFunction = (username?: string, password?: string) => void;
type LogoutFunction = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFunction;
  logout?: LogoutFunction;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: "",
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useImmer<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback(loginCallback, [setState]);
  const logout = useCallback(logoutCallback, [setState]);
  useEffect(authenticationEffect, [pendingAuthentication]);
  const value = { isAuthenticated, login, isAuthenticating, authenticationError, token, logout };
  log("render");

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

  function loginCallback(username?: string, password?: string): void {
    log("login");
    setState((draft) => {
      draft.pendingAuthentication = true;
      draft.username = username;
      draft.password = password;
    });
  }

  function logoutCallback(username?: string, password?: string): void {
    log("logout");
    setState((draft) => {
      draft.isAuthenticated = false;
      draft.username = username;
      draft.password = password;
    });
    (async () => {
      await Storage.clear();
    })();
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    };

    async function authenticate() {
      const token = await Storage.get({ key: "currentToken" });
      if (token.value) {
        setState((draft) => {
          draft.token = token.value!;
          draft.pendingAuthentication = false;
          draft.isAuthenticated = true;
          draft.isAuthenticating = false;
        });
      }
      if (!pendingAuthentication) {
        log("authenticate, !pendingAuth, return");
        return;
      }
      try {
        log("auth...");
        setState((draft) => {
          draft.isAuthenticating = true;
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        if (canceled) {
          return;
        }
        log("auth succeeded");

        await Storage.set({
          key: "currentToken",
          value: token,
        });

        setState((draft) => {
          draft.token = token;
          draft.pendingAuthentication = false;
          draft.isAuthenticated = true;
          draft.isAuthenticating = false;
        });
      } catch (err) {
        if (canceled) {
          return;
        }
        log("auth failed");
        setState((draft) => {
          draft.authenticationError = err as Error;
          draft.pendingAuthentication = false;
          draft.isAuthenticating = false;
        });
      }
    }
  }
};

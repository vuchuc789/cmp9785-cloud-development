'use client';

import {
  getCurrentUserInfoUsersInfoGet,
  loginForAccessTokenUsersLoginPost,
  logoutUsersLogoutDelete,
  refreshAccessTokenUsersRefreshPost,
  registerNewUserUsersRegisterPost,
  resetPasswosdUsersResetPasswordPatch,
  sendResetPasswordEmailUsersResetPasswordPost,
  sendVerificationEmailUsersVerifyEmailPost,
  Token,
  updateUserInfoUsersUpdatePatch,
  UserResponse,
} from '@/client';
import { client } from '@/client/client.gen';
import {
  zBodyLoginForAccessTokenUsersLoginPost,
  zCreateUserForm,
  zEmailRequest,
  zPasswordResetForm,
  zUpdateUserForm,
} from '@/client/zod.gen';
import { RequestOptions } from '@hey-api/client-next';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

enum AuthActionType {
  UpdateAccessToken,
  UpdateUserInfo,
  Logout,
  SetLoading,
}

type AuthAction = { type: AuthActionType; payload?: Partial<AuthState> };
type AuthDispatch = (action: AuthAction) => void;
type AuthState = {
  accessToken?: Token;
  userInfo?: UserResponse;
  isLoading: boolean;
};
type AuthProviderProps = { children: React.ReactNode };

const AuthStateContext = createContext<
  | {
      state: AuthState;
      dispatch: AuthDispatch;
      login: (
        values: z.infer<typeof zBodyLoginForAccessTokenUsersLoginPost>
      ) => Promise<boolean>;
      signup: (values: z.infer<typeof zCreateUserForm>) => Promise<boolean>;
      logout: () => Promise<void>;
      updateUser: (values: z.infer<typeof zUpdateUserForm>) => Promise<boolean>;
      verifyEmail: () => Promise<boolean>;
      sendResetPasswordEmail: (
        values: z.infer<typeof zEmailRequest>
      ) => Promise<boolean>;
      resetPassword: (
        token: string,
        values: z.infer<typeof zPasswordResetForm>
      ) => Promise<boolean>;
    }
  | undefined
>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.UpdateAccessToken: {
      return {
        ...state,
        accessToken: action.payload?.accessToken ?? state.accessToken,
      };
    }
    case AuthActionType.UpdateUserInfo: {
      return { ...state, userInfo: action.payload?.userInfo ?? state.userInfo };
    }
    case AuthActionType.Logout: {
      return {
        ...state,
        accessToken: undefined,
        userInfo: undefined,
      };
    }
    case AuthActionType.SetLoading: {
      return {
        ...state,
        isLoading: action.payload?.isLoading ?? true,
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, { isLoading: true });

  // this ref contains an interceptor of the current access token
  const authInterceptorRef = useRef<
    ((options: RequestOptions<boolean, string>) => void) | null
  >(null);

  const getAuthInterceptor = useCallback((accessToken: string) => {
    return (options: RequestOptions<boolean, string>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options.headers?.set('Authorization', `Bearer ${accessToken}`);
    };
  }, []);

  const updateAuthInfo = useCallback(
    async (accessToken: Token) => {
      const authInterceptor = getAuthInterceptor(accessToken.access_token);

      client.interceptors.request.use(authInterceptor);

      const userRes = await getCurrentUserInfoUsersInfoGet();

      if (userRes.response.status !== 200) {
        client.interceptors.request.eject(authInterceptor);

        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      dispatch({
        type: AuthActionType.UpdateAccessToken,
        payload: { accessToken },
      });
      dispatch({
        type: AuthActionType.UpdateUserInfo,
        payload: { userInfo: userRes.data },
      });

      if (authInterceptorRef.current) {
        // eject the old interceptor
        client.interceptors.request.eject(authInterceptorRef.current);
      }
      authInterceptorRef.current = authInterceptor;

      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    [getAuthInterceptor]
  );

  // log user in with data from login form
  const login = useCallback(
    async (
      values: z.infer<typeof zBodyLoginForAccessTokenUsersLoginPost>
    ): Promise<boolean> => {
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: true },
      });

      if (!values.username || !values.password) {
        toast.error('Username and password should not be empty');
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      const authRes = await loginForAccessTokenUsersLoginPost({
        body: values,
        credentials: 'include',
      });

      if (authRes.response.status !== 200 || !authRes.data) {
        if (typeof authRes.error?.detail === 'string') {
          toast.error(authRes.error.detail);
        } else {
          toast.error('Something went wrong');
        }
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      if (!(await updateAuthInfo(authRes.data))) {
        toast.error('Something went wrong');
        return false;
      }

      toast.info('Logged in successfully');
      return true;
    },
    [updateAuthInfo]
  );

  const signup = useCallback(
    async (values: z.infer<typeof zCreateUserForm>): Promise<boolean> => {
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: true },
      });

      const res = await registerNewUserUsersRegisterPost({
        body: values,
      });

      if (res.response.status !== 200) {
        if (typeof res.error?.detail === 'string') {
          toast.error(res.error.detail);
        } else {
          toast.error('Something went wrong');
        }
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      toast.success('Your account has been created');
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUsersLogoutDelete({ credentials: 'include' });

    if (authInterceptorRef.current) {
      // eject the old interceptor
      client.interceptors.request.eject(authInterceptorRef.current);
      authInterceptorRef.current = null;
    }

    dispatch({ type: AuthActionType.Logout });
  }, []);

  const updateUser = useCallback(
    async (values: z.infer<typeof zUpdateUserForm>) => {
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: true },
      });

      const res = await updateUserInfoUsersUpdatePatch({
        body: values,
      });

      if (res.response.status !== 200) {
        if (typeof res.error?.detail === 'string') {
          toast.error(res.error.detail);
        } else {
          toast.error('Something went wrong');
        }
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      toast.success('Your account has been updated');
      dispatch({
        type: AuthActionType.UpdateUserInfo,
        payload: { userInfo: res.data },
      });
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    []
  );

  const verifyEmail = useCallback(async () => {
    dispatch({
      type: AuthActionType.SetLoading,
      payload: { isLoading: true },
    });

    const res = await sendVerificationEmailUsersVerifyEmailPost();

    if (res.response.status !== 200) {
      toast.error('Something went wrong');

      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return false;
    }

    toast.success('Verifying email has been sent');
    dispatch({
      type: AuthActionType.SetLoading,
      payload: { isLoading: false },
    });

    return true;
  }, []);

  const sendResetPasswordEmail = useCallback(
    async (values: z.infer<typeof zEmailRequest>): Promise<boolean> => {
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: true },
      });

      const res = await sendResetPasswordEmailUsersResetPasswordPost({
        body: values,
      });

      if (res.response.status !== 200) {
        if (typeof res.error?.detail === 'string') {
          toast.error(res.error.detail);
        } else {
          toast.error('Something went wrong');
        }
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      toast.success(
        'If your email is valid, a reset password email will be sent'
      );
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    []
  );

  const resetPassword = useCallback(
    async (
      token: string,
      values: z.infer<typeof zPasswordResetForm>
    ): Promise<boolean> => {
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: true },
      });

      const res = await resetPasswosdUsersResetPasswordPatch({
        body: values,
        query: { token },
      });

      if (res.response.status !== 200) {
        if (typeof res.error?.detail === 'string') {
          toast.error(res.error.detail);
        } else {
          toast.error('Something went wrong');
        }
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      toast.success('Your password has been updated');
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    []
  );

  // check existing session
  useEffect(() => {
    const asyncFunc = async () => {
      const tokenRes = await refreshAccessTokenUsersRefreshPost({
        credentials: 'include',
      });

      if (!tokenRes.data) {
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return;
      }

      await updateAuthInfo(tokenRes.data);
    };

    asyncFunc();
  }, [updateAuthInfo]);

  useEffect(() => {
    if (!state.accessToken) {
      return;
    }

    const asyncFunc = async () => {
      const tokenRes = await refreshAccessTokenUsersRefreshPost({
        credentials: 'include',
      });

      if (!tokenRes.data) {
        return;
      }

      const authInterceptor = getAuthInterceptor(tokenRes.data.access_token);

      client.interceptors.request.use(authInterceptor);

      if (authInterceptorRef.current) {
        client.interceptors.request.eject(authInterceptorRef.current);
      }
      authInterceptorRef.current = authInterceptor;

      dispatch({
        type: AuthActionType.UpdateAccessToken,
        payload: { accessToken: tokenRes.data },
      });
    };

    const timeout = setTimeout(
      asyncFunc,
      process.env.NEXT_PUBLIC_REFRESH_TOKEN_INTERVAL
        ? parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_INTERVAL)
        : 1500000 // set default to 25 minutes
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [state.accessToken, getAuthInterceptor]);

  return (
    <AuthStateContext.Provider
      value={{
        state,
        dispatch,
        login,
        signup,
        logout,
        updateUser,
        verifyEmail,
        sendResetPasswordEmail,
        resetPassword,
      }}
    >
      {children}
    </AuthStateContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export { AuthActionType, AuthProvider, useAuth };

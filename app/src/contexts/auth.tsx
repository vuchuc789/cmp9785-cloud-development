'use client';

import {
  getCurrentUserInfoUsersInfoGet,
  loginForAccessTokenUsersLoginPost,
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
import { useRouter } from 'next/navigation';
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

const ACCESS_TOKEN_SESSION_STORAGE_KEY = 'access-token';

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
      logout: () => void;
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

  const authInterceptorRef = useRef<
    ((options: RequestOptions<boolean, string>) => void) | null
  >(null);

  const router = useRouter();

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
      });

      if (authRes.response.status !== 200) {
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

      const authInterceptor = (options: RequestOptions<boolean, string>) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options.headers?.set(
          'Authorization',
          `Bearer ${authRes.data?.access_token ?? ''}`
        );
      };

      client.interceptors.request.use(authInterceptor);

      const userRes = await getCurrentUserInfoUsersInfoGet();

      if (userRes.response.status !== 200) {
        client.interceptors.request.eject(authInterceptor);

        toast.error('Something went wrong');
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });

        return false;
      }

      sessionStorage.setItem(
        ACCESS_TOKEN_SESSION_STORAGE_KEY,
        authRes.data?.access_token ?? ''
      );

      dispatch({
        type: AuthActionType.UpdateAccessToken,
        payload: { accessToken: authRes.data },
      });
      dispatch({
        type: AuthActionType.UpdateUserInfo,
        payload: { userInfo: userRes.data },
      });

      // client.interceptors.request.eject(authInterceptor);
      authInterceptorRef.current = authInterceptor;

      toast.success('Logged in successfully');
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });

      return true;
    },
    []
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

  const logout = useCallback(() => {
    sessionStorage.removeItem(ACCESS_TOKEN_SESSION_STORAGE_KEY);
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

  // check access token in session storage
  useEffect(() => {
    const asyncFunc = async () => {
      const accessToken = sessionStorage.getItem(
        ACCESS_TOKEN_SESSION_STORAGE_KEY
      );

      if (!accessToken) {
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });
        sessionStorage.removeItem(ACCESS_TOKEN_SESSION_STORAGE_KEY);

        return;
      }

      const authInterceptor = (options: RequestOptions<boolean, string>) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options.headers?.set('Authorization', `Bearer ${accessToken}`);
      };

      client.interceptors.request.use(authInterceptor);

      const userRes = await getCurrentUserInfoUsersInfoGet();

      if (userRes.response.status !== 200) {
        client.interceptors.request.eject(authInterceptor);
        dispatch({
          type: AuthActionType.SetLoading,
          payload: { isLoading: false },
        });
        sessionStorage.removeItem(ACCESS_TOKEN_SESSION_STORAGE_KEY);

        return;
      }

      dispatch({
        type: AuthActionType.UpdateAccessToken,
        payload: {
          accessToken: { access_token: accessToken, token_type: 'bearer' },
        },
      });
      dispatch({
        type: AuthActionType.UpdateUserInfo,
        payload: { userInfo: userRes.data },
      });

      // client.interceptors.request.eject(authInterceptor);
      authInterceptorRef.current = authInterceptor;
      dispatch({
        type: AuthActionType.SetLoading,
        payload: { isLoading: false },
      });
    };

    asyncFunc();
  }, []);

  useEffect(() => {
    if (!state.accessToken?.access_token && authInterceptorRef.current) {
      client.interceptors.request.eject(authInterceptorRef.current);
      authInterceptorRef.current = null;
    }
  }, [state.accessToken?.access_token]);

  useEffect(() => {
    const unauthorizedCheckInterceptor = (response: Response) => {
      if (response.status === 401) {
        logout();
        router.push('/login');
        toast.warning('Your session has been expired');
      }

      return response;
    };

    client.interceptors.response.use(unauthorizedCheckInterceptor);

    return () => {
      client.interceptors.response.eject(unauthorizedCheckInterceptor);
    };
  }, [logout, router]);

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

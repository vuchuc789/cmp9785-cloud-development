import {
  AudioSearchResponse,
  deleteHistoryMediaHistoryDelete,
  getHistoryMediaHistoryGet,
  ImageSearchResponse,
  MediaHistoryResponse,
  MediaLicense,
  MediaType,
  searchMediaMediaSearchGet,
} from '@/client';
import { zMediaLicense, zMediaType } from '@/client/zod.gen';
import { useAuthRequired } from '@/hooks/auth';
import { debounce } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

enum SearchActionType {
  UpdateResult,
  UpdateHistory,
}

type SearchState = {
  imageResult?: ImageSearchResponse;
  audioResult?: AudioSearchResponse;
  history: MediaHistoryResponse[];
};
type SearchAction = { type: SearchActionType; payload?: Partial<SearchState> };
type SearchDispatch = (action: SearchAction) => void;

type SearchProviderProps = { children: React.ReactNode };

const zSearchParams = z.object({
  type: zMediaType,
  q: z.string().max(200),
  page: z.number().int().min(1),
  page_size: z.number().int().min(1),
  license: z.union([z.array(zMediaLicense), z.null()]),
});

const SearchContext = createContext<
  | {
      state: SearchState;
      dispatch: SearchDispatch;
      form: ReturnType<typeof useForm<z.infer<typeof zSearchParams>>>;
      search: () => void;
      deleteHistory: (keyword?: string) => Promise<void>;
    }
  | undefined
>(undefined);

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case SearchActionType.UpdateResult: {
      return {
        ...state,
        imageResult: action.payload?.imageResult,
        audioResult: action.payload?.audioResult,
      };
    }

    case SearchActionType.UpdateHistory: {
      return {
        ...state,
        history: action.payload?.history ?? state.history,
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, { history: [] });

  const form = useForm<z.infer<typeof zSearchParams>>({
    resolver: zodResolver(zSearchParams),
    defaultValues: {
      type: MediaType.IMAGE,
      q: '',
      page: 1,
      page_size: 12,
      license: null,
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthLoading = useAuthRequired();

  const search = useMemo(
    () =>
      debounce(() => {
        // reset to page 1 when proceeding search
        form.setValue('page', 1);

        const query = form.getValues();

        const newSearchParams = new URLSearchParams({
          type: query.type,
          q: query.q,
          page: String(query.page),
        });

        if (query.license?.length) {
          query.license.forEach((lic) => {
            newSearchParams.append('license', lic);
          });
        }

        router.push(`/search?${newSearchParams.toString()}`, { scroll: false });
      }, 500),
    [form, router]
  );

  const getHistory = useCallback(async () => {
    const res = await getHistoryMediaHistoryGet();

    dispatch({
      type: SearchActionType.UpdateHistory,
      payload: {
        history: res.data?.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        ),
      },
    });
  }, []);

  const deleteHistory = useCallback(
    async (keyword?: string) => {
      const oldHistory = [...state.history];

      dispatch({
        type: SearchActionType.UpdateHistory,
        payload: {
          history:
            typeof keyword === 'string'
              ? state.history.filter((hi) => hi.keyword !== keyword)
              : [],
        },
      });

      const res = await deleteHistoryMediaHistoryDelete({
        query: {
          keyword: keyword,
        },
      });

      if (!res.data) {
        toast.error('Failed to delete history');
        dispatch({
          type: SearchActionType.UpdateHistory,
          payload: { history: oldHistory },
        });

        return;
      }

      dispatch({
        type: SearchActionType.UpdateHistory,
        payload: {
          history: res.data.sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          ),
        },
      });
    },
    [state.history]
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const asyncFunc = async () => {
      const mediaType = searchParams.get('type');
      if (mediaType === 'image' || mediaType === 'audio') {
        form.setValue('type', mediaType);
      }

      const q = searchParams.get('q');
      if (typeof q === 'string') {
        form.setValue('q', q);
      }

      const page = searchParams.get('page');
      if (page && parseInt(page) > 0) {
        form.setValue('page', parseInt(page));
      }

      const license = (searchParams.getAll('license') as MediaLicense[]).filter(
        (lic) => Object.values(MediaLicense).includes(lic)
      );
      if (license.length) {
        form.setValue('license', license);
      }

      const query = form.getValues();

      const res = await searchMediaMediaSearchGet({ query });
      if (!res.data) {
        if (res.error.detail?.[0].msg) {
          toast.error(res.error.detail[0].msg);
        } else {
          toast.error('Something went wrong');
        }

        return;
      }

      switch (query.type) {
        case 'image':
          dispatch({
            type: SearchActionType.UpdateResult,
            payload: { imageResult: res.data as ImageSearchResponse },
          });
          break;
        case 'audio':
          dispatch({
            type: SearchActionType.UpdateResult,
            payload: { audioResult: res.data as AudioSearchResponse },
          });
          break;
      }

      await getHistory();
    };

    asyncFunc();
  }, [searchParams, form, isAuthLoading, getHistory]);

  return (
    <SearchContext.Provider
      value={{
        state,
        dispatch,
        form,
        search,
        deleteHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

export { SearchActionType, SearchProvider, useSearch };

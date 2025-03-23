import { MediaType } from '@/client';
import {
  zAudioCategory,
  zAudioLength,
  zImageAspectRatio,
  zImageCategory,
  zImageSize,
  zMediaLicense,
  zMediaLicenseType,
  zMediaType,
} from '@/client/zod.gen';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

enum SearchActionType {
  SetForm,
}

type SearchState = {
  form?: ReturnType<typeof useForm<z.infer<typeof zSearchParams>>>;
};
type SearchAction = { type: SearchActionType; payload?: Partial<SearchState> };
type SearchDispatch = (action: SearchAction) => void;

type SearchProviderProps = { children: React.ReactNode };

const zSearchParams = z.object({
  type: zMediaType,
  q: z.string().max(200),
  page: z.number().int().min(1),
  page_size: z.number().int().min(1),
  license: z.array(zMediaLicense),
  license_type: z.array(zMediaLicenseType),
  categories: z.union([z.array(zImageCategory), z.array(zAudioCategory)]),
  aspect_ratio: z.array(zImageAspectRatio),
  size: z.array(zImageSize),
  length: z.array(zAudioLength),
});

const SearchContext = createContext<
  | {
      state: SearchState;
      dispatch: SearchDispatch;
    }
  | undefined
>(undefined);

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case SearchActionType.SetForm: {
      return {
        ...state,
        form: action.payload?.form,
      };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, {});

  const form = useForm<z.infer<typeof zSearchParams>>({
    resolver: zodResolver(zSearchParams),
    defaultValues: {
      type: MediaType.IMAGE,
      q: '',
      page: 1,
      page_size: 12,
      license: [],
      license_type: [],
      categories: [],
      aspect_ratio: [],
      size: [],
      length: [],
    },
  });
  const formInitialized = useRef(false);

  useEffect(() => {
    if (formInitialized.current || state.form) {
      return;
    }

    dispatch({ type: SearchActionType.SetForm, payload: { form } });
    formInitialized.current = true;
  }, [form, state.form]);

  return (
    <SearchContext.Provider
      value={{
        state,
        dispatch,
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

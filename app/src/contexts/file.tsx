'use client';

import {
  deleteFileFilesFileIdDelete,
  listFilesFilesGet,
  ListFilesResponse,
  SortBy,
  SortOrder,
  uploadFileFilesUploadPost,
} from '@/client';
import { zSortBy, zSortOrder } from '@/client/zod.gen';
import { useAuthRequired } from '@/hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export enum FileActionType {
  UpdateResult,
}

type FileState = {
  fileResult?: ListFilesResponse;
};

type FileAction = {
  type: FileActionType;
  payload?: Partial<FileState>;
};
type FileDispatch = (action: FileAction) => void;

type FileProviderProps = { children: React.ReactNode };

const FileContext = createContext<
  | {
      state: FileState;
      dispatch: FileDispatch;
      listFilesForm: ReturnType<
        typeof useForm<z.infer<typeof zListFilesParams>>
      >;
      listFiles: () => Promise<void>;
      uploadFile: (file: File) => Promise<void>;
      deleteFile: (fileId: number) => Promise<void>;
    }
  | undefined
>(undefined);

const fileReducer = (state: FileState, action: FileAction): FileState => {
  switch (action.type) {
    case FileActionType.UpdateResult:
      return {
        ...state,
        fileResult: action.payload?.fileResult ?? state.fileResult,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const zListFilesParams = z.object({
  page: z.coerce.number().int().min(1),
  page_size: z.coerce.number().int().min(1).max(50),
  sort_by: zSortBy,
  order: zSortOrder,
});

const defaultListFilesParams: ReturnType<typeof zListFilesParams.parse> = {
  page: 1,
  page_size: 12,
  sort_by: SortBy.CREATED_AT,
  order: SortOrder.DESC,
};

export const FileProvider = ({ children }: FileProviderProps) => {
  const [state, dispatch] = useReducer(fileReducer, {});

  const listFilesForm = useForm<z.infer<typeof zListFilesParams>>({
    resolver: zodResolver(zListFilesParams),
    defaultValues: defaultListFilesParams,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthLoading = useAuthRequired();

  const listFiles = useCallback(async () => {
    // reset to page 1 when proceeding search
    listFilesForm.setValue('page', 1);

    const query = listFilesForm.getValues();
    const flatQuery = Object.entries(query).map((record) => [
      record[0],
      record[1].toString(),
    ]);

    // force refresh
    flatQuery.push(['nounce', crypto.randomUUID()]);

    const urlSearchParams = new URLSearchParams(flatQuery);
    router.push(`${pathname}?${urlSearchParams.toString()}`, { scroll: false });
  }, [listFilesForm, router, pathname]);

  const uploadFile = useCallback(
    async (file: File) => {
      const result = await uploadFileFilesUploadPost({ body: { file } });
      if (typeof result.error?.detail === 'string') {
        toast.error(result.error.detail);
        return;
      }
      if (result.error) {
        toast.error('Failed to upload file');
        return;
      }

      listFilesForm.setValue('sort_by', SortBy.CREATED_AT);
      listFilesForm.setValue('order', SortOrder.DESC);

      await listFiles();
    },
    [listFilesForm, listFiles]
  );

  const deleteFile = useCallback(
    async (fileId: number) => {
      const result = await deleteFileFilesFileIdDelete({
        path: { file_id: fileId },
      });
      if (typeof result.error?.detail === 'string') {
        toast.error(result.error.detail);
        return;
      }
      if (result.error) {
        toast.error('Failed to delete file');
        return;
      }

      await listFiles();
    },
    [listFiles]
  );

  useEffect(() => {
    (async () => {
      if (isAuthLoading) {
        return;
      }

      const formKeys = Object.keys(listFilesForm.getValues());

      const query = searchParams
        .entries()
        .filter((entry) => formKeys.includes(entry[0]))
        .reduce<{ [key: string]: string }>((prev, curr) => {
          return { ...prev, [curr[0]]: curr[1] };
        }, {});

      const result = await zListFilesParams.safeParseAsync({
        ...defaultListFilesParams,
        ...query,
      });
      if (result.error) {
        toast.error('Something wrong with search params');
        return;
      }

      listFilesForm.reset(result.data);

      const res = await listFilesFilesGet({ query: result.data });
      if (res.error) {
        toast.error('Failed to list files');
        return;
      }

      dispatch({
        type: FileActionType.UpdateResult,
        payload: { fileResult: res.data },
      });
    })();
  }, [listFilesForm, isAuthLoading, searchParams]);

  return (
    <FileContext.Provider
      value={{
        state,
        dispatch,
        listFilesForm,
        listFiles,
        uploadFile,
        deleteFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }

  return context;
};

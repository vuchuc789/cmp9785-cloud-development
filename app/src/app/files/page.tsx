'use client';

import type React from 'react';

import { FileResponse, SortBy, SortOrder } from '@/client';
import { FileCard, getFileIcon } from '@/components/file-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFile } from '@/contexts/file';
import { usePagination } from '@/hooks/pagination';
import { formatFileSize } from '@/lib/utils';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  File,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react';
import moment from 'moment';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

export default function FilesPage() {
  const [fileToDelete, setFileToDelete] = useState<FileResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [fileToCancel, setFileToCancel] = useState<FileResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    state: { fileResult },
    listFilesForm,
    listFiles,
    uploadFile,
    deleteFile,
  } = useFile();

  const { sort_by: sortBy, order: sortOrder } = listFilesForm.getValues();

  const pagination = usePagination({
    pageNumber: fileResult?.page ?? 1,
    pageCount: fileResult?.page_count ?? 1,
  });

  // Handle sort
  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      listFilesForm.setValue(
        'order',
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
      );
    } else {
      listFilesForm.setValue('sort_by', field);
      listFilesForm.setValue('order', SortOrder.ASC);
    }

    listFiles();
  };

  // Handle retry
  const handleRetry = (file: FileResponse) => {
    console.log(file.id);
  };

  // Handle cancel confirmation
  const confirmCancel = (file: FileResponse) => {
    setFileToCancel(file);
    setShowCancelDialog(true);
  };

  // Handle cancel
  const handleCancel = () => {
    if (!fileToCancel) return;

    setFileToCancel(null);
    setShowCancelDialog(false);
  };

  // Handle delete
  const handleDelete = () => {
    setShowDeleteDialog(false);

    if (fileToDelete) {
      deleteFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  const handleUpload = () => {
    setShowUploadDialog(false);

    if (fileToUpload) {
      uploadFile(fileToUpload);
      setFileToUpload(null);
    }
  };

  // Show description dialog
  const showDescription = (file: FileResponse) => {
    setSelectedFile(file);
    // Set the active version as selected by default
    setShowDescriptionDialog(true);
  };

  // Handle version selection
  const handleVersionSelect = (versionId: string) => {
    console.log(versionId);
  };

  // Handle version revert
  // const handleVersionRevert = () => {
  //   if (!selectedFile) return;
  // };

  // Handle copy description
  const handleCopyDescription = () => {
    if (!selectedFile) return;

    // Get the text to copy - either the selected version or the active description
    const textToCopy =
      selectedFile.file_descriptions.find(
        (v) => v.id === selectedFile.active_file_description_id
      )?.description || '';

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        // Show success state
        setIsCopied(true);
        // Reset after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Only take the first file if multiple files are selected
    const file = selectedFiles[0];

    if (!fileToUpload) {
      setFileToUpload(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // Create a new FileList with only the first file
      const singleFileList = new DataTransfer();
      singleFileList.items.add(droppedFiles[0]);
      handleFileSelect(singleFileList.files);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPageQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));

      return params.toString();
    },
    [searchParams]
  );

  return (
    <main className="grow max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 md:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Your Files</h1>
        <Button
          className="cursor-pointer"
          onClick={() => setShowUploadDialog(true)}
        >
          Upload New File
        </Button>
      </div>

      {/* Sorting controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium">Sort by:</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 h-8 cursor-pointer ${sortBy === SortBy.CREATED_AT ? 'bg-muted' : ''}`}
            onClick={() => handleSort(SortBy.CREATED_AT)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Date
            {sortBy === SortBy.CREATED_AT && (
              <span className="ml-1">
                {sortOrder === SortOrder.ASC ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <SortDesc className="h-3 w-3" />
                )}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 h-8 cursor-pointer ${sortBy === SortBy.NAME ? 'bg-muted' : ''}`}
            onClick={() => handleSort(SortBy.NAME)}
          >
            <File className="h-4 w-4 mr-1" />
            Name
            {sortBy === SortBy.NAME && (
              <span className="ml-1">
                {sortOrder === SortOrder.ASC ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <SortDesc className="h-3 w-3" />
                )}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 h-8 cursor-pointer ${sortBy === SortBy.STATUS ? 'bg-muted' : ''}`}
            onClick={() => handleSort(SortBy.STATUS)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Status
            {sortBy === SortBy.STATUS && (
              <span className="ml-1">
                {sortOrder === SortOrder.ASC ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <SortDesc className="h-3 w-3" />
                )}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Card-based file list */}
      {!fileResult?.results.length ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            No files found. Upload a file to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fileResult.results.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              viewDescription={showDescription}
              retryProccessing={handleRetry}
              cancelProccessing={confirmCancel}
              deleteFile={(file) => {
                setFileToDelete(file);
                setShowDeleteDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {fileResult && fileResult.result_count > fileResult.page_size && (
        <div className="mt-6">
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      fileResult.page <= 1
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(fileResult.page - 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
                {pagination.map((ele) => {
                  if (ele === 'left-ellipsis' || ele === 'right-ellipsis') {
                    return (
                      <PaginationItem key={ele}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={ele}>
                      <PaginationLink
                        href={pathname + '?' + getPageQueryString(ele)}
                        isActive={fileResult.page === ele}
                        scroll={false}
                      >
                        {ele}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href={
                      fileResult.page >= fileResult.page_count
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(fileResult.page + 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Processing</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel processing for &quot;
              {fileToCancel?.filename}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              No, Continue
            </Button>
            <Button className="cursor-pointer" onClick={handleCancel}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{fileToDelete?.filename}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Dialog with Version Control Dropdown and Copy Button */}
      <Dialog
        open={showDescriptionDialog}
        onOpenChange={setShowDescriptionDialog}
      >
        <DialogContent
          className="max-w-2xl"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedFile?.filename}
            </DialogTitle>
          </DialogHeader>

          {selectedFile && selectedFile.file_descriptions.length > 0 && (
            <div className="space-y-4 mt-2">
              {/* Description content - with fixed height and scrolling */}
              <div className="group relative h-[400px] overflow-y-auto border rounded-md p-6 bg-card custom-scrollbar">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 shadow-sm cursor-pointer"
                        onClick={handleCopyDescription}
                        aria-label="Copy description"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isCopied ? 'Copied!' : 'Copy description'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-foreground whitespace-pre-line text-base leading-relaxed">
                  {selectedFile.file_descriptions.find(
                    (v) => v.id === selectedFile.active_file_description_id
                  )?.description || ''}
                </p>
              </div>

              {/* Version selection dropdown - now smaller and below the content */}
              {selectedFile.file_descriptions.length > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">Version:</div>
                  <div className="flex-1">
                    <Select
                      value={
                        selectedFile.active_file_description_id?.toString() ||
                        ''
                      }
                      onValueChange={handleVersionSelect}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select a version" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFile.file_descriptions.map((version) => (
                          <SelectItem
                            key={version.id}
                            value={version.id.toString()}
                            className="text-xs"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {moment(version.created_at).fromNow()}
                                {version.id ===
                                  selectedFile.active_file_description_id && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded">
                                    Active
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground ml-4">
                                {moment(version.created_at).format(
                                  'MMM dd, YYYY, hh:mm:ss A'
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* {selectedFile.active_file_description_id && */}
                  {/*   !selectedFile.descriptionVersions.find( */}
                  {/*     (v) => v.id === selectedVersionId */}
                  {/*   )?.isActive && ( */}
                  {/*     <Button */}
                  {/*       onClick={handleVersionRevert} */}
                  {/*       size="sm" */}
                  {/*       variant="outline" */}
                  {/*       className="text-xs h-8" */}
                  {/*     > */}
                  {/*       Revert to This Version */}
                  {/*     </Button> */}
                  {/*   )} */}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              className="cursor-pointer"
              onClick={() => setShowDescriptionDialog(false)}
              size="sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to generate AI description. Supported formats
              include images, documents, audio, and video.
            </DialogDescription>
          </DialogHeader>

          {!fileToUpload ? (
            /* Drag and drop area - only shown when no file is being uploaded */
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleFileInputClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv"
              />
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium">
                  <span className="text-blue-500">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload one file at a time (max 5MB)
                </p>
              </div>
            </div>
          ) : (
            /* Upload status - shown when a file is being uploaded */
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/10">
                <div className="opacity-70">
                  {getFileIcon(fileToUpload.type || 'application/octet-stream')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div
                      className="truncate font-medium max-w-[165px] sm:max-w-[300px]"
                      title={fileToUpload.name}
                    >
                      {fileToUpload.name}
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-2 cursor-pointer"
                        onClick={() => setFileToUpload(null)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {formatFileSize(fileToUpload.size)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="cursor-pointer" onClick={handleUpload} size="sm">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

'use client';

import type React from 'react';

import { FileProcessingStatus, FileResponse } from '@/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  File,
  FileAudio,
  Files,
  FileText,
  FileVideo,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import moment from 'moment';
import { formatFileSize } from '@/lib/utils';

// Replace the getFileIcon function with this more subtle version
export function getFileIcon(fileType: string) {
  // Use a consistent, muted color for all icons
  const iconClass = 'h-4 w-4 text-muted-foreground opacity-70';

  if (fileType.startsWith('image/')) {
    return <ImageIcon className={iconClass} />;
  } else if (fileType.startsWith('audio/')) {
    return <FileAudio className={iconClass} />;
  } else if (fileType.startsWith('video/')) {
    return <FileVideo className={iconClass} />;
  } else if (fileType.includes('pdf')) {
    return <FileText className={iconClass} />;
  } else if (fileType.includes('spreadsheet') || fileType.includes('csv')) {
    return <FileText className={iconClass} />;
  } else if (fileType.includes('presentation')) {
    return <FileText className={iconClass} />;
  } else {
    return <File className={iconClass} />;
  }
}

// Truncate text function
export function truncateText(text: string, maxLength = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Status badge component
export function StatusBadge({ status }: { status: FileProcessingStatus }) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-yellow-600 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950"
        >
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      );
    case 'queuing':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-orange-600 border-orange-300 bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-950"
        >
          <Clock className="h-3 w-3" />
          <span>Queuing</span>
        </Badge>
      );
    case 'processing':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-blue-600 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing</span>
        </Badge>
      );
    case 'success':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-green-600 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Success</span>
        </Badge>
      );
    case 'failed':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-red-600 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
        >
          <AlertCircle className="h-3 w-3" />
          <span>Failed</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-slate-600 border-slate-300 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-950"
        >
          <Ban className="h-3 w-3" />
          <span>Cancelled</span>
        </Badge>
      );
    default:
      return null;
  }
}

export type FileCardProps = {
  file: FileResponse;
  viewDescription: (file: FileResponse) => void;
  retryProccessing: (file: FileResponse) => void;
  cancelProccessing: (file: FileResponse) => void;
  deleteFile: (file: FileResponse) => void;
};

export const FileCard: React.FC<FileCardProps> = ({
  file,
  viewDescription,
  retryProccessing,
  cancelProccessing,
  deleteFile,
}) => {
  return (
    <Card key={file.id} className="overflow-hidden flex flex-col py-0">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0 opacity-70">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium truncate" title={file.filename}>
                {file.filename}
              </h3>
              <StatusBadge status={file.status} />
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {moment(file.created_at).format('MMM dd, YYYY, hh:mm:ss A')}
              <span className="mx-1">•</span>
              {formatFileSize(file.size)}
            </div>
            <div className="mt-3">
              {file.status === 'success' ? (
                <p className="text-sm text-muted-foreground">
                  {truncateText(
                    file.file_descriptions[0]?.description ?? '',
                    120
                  )}
                </p>
              ) : file.status === 'failed' ? (
                <span className="text-sm text-muted-foreground italic">
                  Generation failed
                </span>
              ) : file.status === 'processing' ? (
                <span className="text-sm text-muted-foreground italic">
                  Generating description...
                </span>
              ) : file.status === 'cancelled' ? (
                <span className="text-sm text-muted-foreground italic">
                  Processing cancelled
                </span>
              ) : file.status === 'queuing' ? (
                <span className="text-sm text-muted-foreground italic">
                  Waiting in queue...
                </span>
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  Waiting to process
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      {/* Card footer to show the appropriate buttons based on file status */}
      <CardFooter className="px-4 py-3 bg-muted/10 flex justify-end mt-auto">
        <div className="flex items-center gap-2">
          {/* Show View Description button for files with success status */}
          {file.status === 'success' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer rounded-full"
                  onClick={() => {
                    viewDescription(file);
                  }}
                >
                  <Files className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Description</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Show retry button for success, failed, or cancelled files */}
          {(file.status === 'success' ||
            file.status === 'failed' ||
            file.status === 'cancelled') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer rounded-full"
                  onClick={() => {
                    retryProccessing(file);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retry</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Show cancel button for pending or processing files */}
          {file.status === 'pending' ||
          file.status === 'queuing' ||
          file.status === 'processing' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-full"
                  onClick={() => {
                    cancelProccessing(file);
                  }}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-full"
                  onClick={() => {
                    deleteFile(file);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={file.url}
                className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                download={file.filename}
                aria-label={`Download ${file.filename}`}
              >
                <Download className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download file ({formatFileSize(file.size)})</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
};

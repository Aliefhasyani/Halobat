"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
  type FileUploadProps,
} from "@/components/ui/file-upload";

/**
 * A small reusable hook that returns an `onUpload` handler which uploads
 * files to the backend `/api/upload-image` endpoint using XHR so we can
 * report progress and receive the returned `url` from the server.
 */
export function useDirectUpload(
  onUploaded?: (file: File, url: string) => void
): NonNullable<FileUploadProps["onUpload"]> {
  return React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      for (const file of files) {
        await new Promise<void>((resolve, reject) => {
          try {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

            const formData = new FormData();
            formData.append("image", file);

            const xhr = new XMLHttpRequest();
            xhr.open(
              "POST",
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-image`
            );
            if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                onProgress(file, pct);
              }
            };

            xhr.onload = () => {
              try {
                const json = JSON.parse(xhr.responseText || "{}");
                if (xhr.status >= 200 && xhr.status < 300 && json.url) {
                  // Call the optional callback with returned URL
                  onUploaded?.(file, String(json.url));
                  onSuccess(file);
                  resolve();
                } else {
                  const msg =
                    json?.error ??
                    json?.message ??
                    xhr.statusText ??
                    "Upload failed";
                  onError(file, new Error(msg));
                  reject(new Error(msg));
                }
              } catch (err) {
                onError(file, new Error("Invalid response from server"));
                reject(err as Error);
              }
            };

            xhr.onerror = () => {
              onError(file, new Error("Network error"));
              reject(new Error("Network error"));
            };

            xhr.send(formData);
          } catch (err) {
            onError(
              file,
              err instanceof Error ? err : new Error("Upload failed")
            );
            reject(err);
          }
        });
      }
    },
    [onUploaded]
  );
}

/**
 * Demo component — a direct upload example that uses the shared `useDirectUpload` hook.
 * It uploads to the backend and stores the returned URL(s) in local state.
 */
export function FileUploadDirectUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);

  // For demo usage we capture the returned URL in console; real forms should
  // wire `onUploaded` to set a form field (e.g. react-hook-form's setValue).
  const onUpload = useDirectUpload((file, url) => {
    console.info("Uploaded:", file.name, url);
  });

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onUpload={onUpload}
      onFileReject={onFileReject}
      maxFiles={2}
      className="w-full max-w-md"
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            {/* small visual cue — left to consumers to style */}
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max 2 files)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="flex-col">
            <div className="flex w-full items-center gap-2">
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  ×
                </Button>
              </FileUploadItemDelete>
            </div>
            <FileUploadItemProgress />
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}

export default FileUploadDirectUploadDemo;

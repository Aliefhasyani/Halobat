"use client";

import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import uploadFile from "@/lib/upload";

type Props = {
  initialUrl?: string | null;
  onUploaded?: (url: string) => void;
  className?: string;
};

export default function FileUploader({
  initialUrl = null,
  onUploaded,
  className,
}: Props) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(initialUrl);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setPreview(initialUrl ?? null);
  }, [initialUrl]);

  async function doUpload(f: File) {
    const endpoint = process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL ?? "";
    try {
      setUploading(true);
      setProgress(0);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") ?? undefined
          : undefined;
      const res = await uploadFile(f, {
        endpoint,
        token: token ?? undefined,
        onProgress: (p) => setProgress(p),
      });
      setPreview(res.url);
      onUploaded?.(res.url);
    } catch (e) {
      console.error(e);
      // swallow, pages will show errors if needed
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 600);
    }
  }

  const onFiles = React.useCallback((f?: File | null) => {
    if (!f) return;
    setFile(f);
    doUpload(f);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Upload image</div>
        <div className="text-xs text-muted-foreground">
          Drag & drop or choose file
        </div>
      </div>

      <div
        className="relative rounded-md border-2 border-dashed border-muted p-3 flex items-center gap-3"
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer?.files?.[0] ?? null;
          if (f) onFiles(f);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFiles(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose file
            </Button>
            <div className="text-xs text-muted-foreground">or drop here</div>
          </div>

          <div className="mt-3">
            {uploading && progress !== null ? (
              <div className="w-full bg-muted/30 h-2 rounded overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-2 bg-primary"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-24 h-24 rounded border overflow-hidden bg-white flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              className="w-full h-full object-cover"
              alt="preview"
            />
          ) : (
            <div className="text-xs text-muted-foreground p-2">No image</div>
          )}
        </div>
      </div>
    </div>
  );
}

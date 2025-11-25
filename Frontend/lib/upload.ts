/*
 * upload.ts — small helper for uploading a single file to an external upload service
 * - Uses fetch for simple uploads (POST multipart/form-data)
 * - Falls back to XMLHttpRequest only when a progress callback is provided
 * - Expects the upload service to return JSON containing a public URL under
 *   `url`, `publicUrl` or `path` (in that preference order).
 */

export type UploadProgressCb = (progressPercent: number) => void;

export type UploadResult = {
  url: string;
  raw: unknown;
};

const DEFAULT_UPLOAD_PATH = process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL ?? "";
const MINIO_ENDPOINT = process.env.NEXT_PUBLIC_MINIO_ENDPOINT ?? "";
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? "";

function extractUrlFromResponse(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === "string") return body;

  if (typeof body === "object" && body !== null) {
    const b = body as Record<string, unknown>;
    if (typeof b.url === "string") return b.url;
    if (typeof b.publicUrl === "string") return b.publicUrl;
    if (typeof b.path === "string") return b.path;
    // sometimes file servers return { data: { url: '...' } }
    if (typeof b.data === "object" && b.data !== null)
      return extractUrlFromResponse(b.data);
  }

  return null;
}

export async function uploadFile(
  file: File,
  opts?: { endpoint?: string; token?: string; onProgress?: UploadProgressCb }
): Promise<UploadResult> {
  const endpoint = opts?.endpoint ?? DEFAULT_UPLOAD_PATH;
  if (!endpoint)
    throw new Error(
      "UPLOAD_SERVICE_URL not configured. Set NEXT_PUBLIC_UPLOAD_SERVICE_URL."
    );

  // If a MinIO endpoint & bucket are configured, use direct (presigned) flow.
  // This lets the browser request a presigned PUT URL from the backend and upload directly.
  if (MINIO_ENDPOINT && MINIO_BUCKET) {
    const token = opts?.token ?? (typeof window !== "undefined" ? localStorage.getItem("token") ?? undefined : undefined);
    const presignRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/uploads/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
    });

    if (!presignRes.ok) {
      const text = await presignRes.text().catch(() => "");
      throw new Error(`Failed to get presigned URL: ${presignRes.status} ${presignRes.statusText} ${text}`);
    }

    const presignJson = await presignRes.json().catch(() => null);
    const presignedUrl = presignJson?.presignedUrl ?? null;
    const publicUrl = presignJson?.publicUrl ?? null;
    if (!presignedUrl) throw new Error("Server did not return a presignedUrl");

    // upload via XHR if caller requested progress events
    if (opts?.onProgress) {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ url: publicUrl ?? presignedUrl, raw: presignJson });
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.send(file);
      });
    }

    // fetch-based PUT (no progress)
    const putRes = await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText}`);

    return { url: publicUrl ?? presignedUrl, raw: presignJson };
  }

  // If caller wants upload progress, use XHR which supports progress events
  if (opts?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);
      if (opts?.token)
        xhr.setRequestHeader("Authorization", `Bearer ${opts.token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            const url = extractUrlFromResponse(json);
            if (!url)
              return reject(
                new Error("Upload response did not include a file URL")
              );
            resolve({ url, raw: json });
          } catch {
            reject(new Error("Invalid JSON response from upload service"));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));

      const fd = new FormData();
      // common param name is file — many file servers expect `file` or `upload`
      fd.append("file", file, file.name);
      xhr.send(fd);
    });
  }

  // Simple fetch-based upload (no progress callback)
  const fd = new FormData();
  fd.append("file", file, file.name);

  const headers: Record<string, string> = {};
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(endpoint, { method: "POST", body: fd, headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => undefined);
    throw new Error(
      `Upload failed: ${res.status} ${res.statusText} ${txt ?? ""}`
    );
  }
  const json = await res.json().catch(() => null);
  const url = extractUrlFromResponse(json);
  if (!url) throw new Error("Upload response did not include a file URL");
  return { url, raw: json };
}

export default uploadFile;

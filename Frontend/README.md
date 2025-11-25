This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Development
Start the dev server: `pnpm dev`

Security note (auth):
- The app stores authentication tokens in localStorage (key: `token`) so the client can call protected endpoints.
- For security we do NOT persist the user's `role` in localStorage. After login the client calls `/api/profile` (server-protected) to learn the role when it needs to route or check permissions.
	This avoids leaving role information accessible in persistent client storage.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## File uploads / configuration

This frontend provides a small upload helper that expects an external upload service (like the Railway file-server or any S3-backed uploader) to accept a multipart POST under the `file` field and return JSON containing a public URL for the uploaded file. The helper looks for the environment variable `NEXT_PUBLIC_UPLOAD_SERVICE_URL`.

Example environment variables (see `.env.example`):

```
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_UPLOAD_SERVICE_URL=https://your-upload-service.example.com/upload
```

When a user selects a file in the drug/brand pages the client calls the upload endpoint and sets the returned public URL into the `picture` form field. The repository uses a small helper in `lib/upload.ts` — you can swap the `NEXT_PUBLIC_UPLOAD_SERVICE_URL` value for any uploader that follows the convention.

Important: DO NOT point the frontend at the MinIO Console (admin UI). The frontend must POST file multipart data to a dedicated uploader endpoint (file-server) or upload directly to MinIO using presigned URLs. The MinIO Console is for administration (creating buckets, configuring policies) and is not an upload endpoint.

If you deployed MinIO using Railway templates and also deployed the file-server uploader, set `NEXT_PUBLIC_UPLOAD_SERVICE_URL` to the uploader's `/upload` endpoint. Example:

```
NEXT_PUBLIC_UPLOAD_SERVICE_URL=https://file-server-abc123.up.railway.app/upload
```

If you prefer direct browser uploads to MinIO (advanced), implement a server-side presign endpoint in your backend that generates presigned PUT/POST URLs and set `NEXT_PUBLIC_MINIO_ENDPOINT` and `NEXT_PUBLIC_MINIO_BUCKET` accordingly.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = "auto";
const ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY;
const BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;

const s3Client = new S3Client({
  region: REGION,
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (file: File | Blob | string, path: string): Promise<string> => {
  let body: Buffer | Uint8Array | Blob | string;
  let contentType: string | undefined;

  if (typeof file === 'string' && file.startsWith('data:')) {
    const response = await fetch(file);
    body = await response.blob();
    contentType = file.split(';')[0].split(':')[1];
  } else {
    body = file;
    if (file instanceof File || file instanceof Blob) {
      contentType = file.type;
    }
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  // Note: R2 public access depends on bucket configuration. 
  // For simplicity, we return the path or a constructed public URL if configured.
  return `https://pub-your-worker-id.r2.dev/${path}`; 
};

export const saveBookingToR2 = async (data: any): Promise<void> => {
  const path = `bookings/${data.id || Date.now()}.json`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  });

  await s3Client.send(command);
};

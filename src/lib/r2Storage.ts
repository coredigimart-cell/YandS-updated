import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const getS3Client = () => {
  const ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
  const ACCESS_KEY_ID = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID;
  const SECRET_ACCESS_KEY = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY;
  const BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;

  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    console.error("Cloudflare R2 environment variables are missing");
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
};

export const uploadToR2 = async (file: File | Blob | string, path: string): Promise<string> => {
  const s3Client = getS3Client();
  if (!s3Client) return typeof file === 'string' ? file : '';

  const BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;
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
  return `https://pub-your-worker-id.r2.dev/${path}`; 
};

export const saveBookingToR2 = async (data: any): Promise<void> => {
  const s3Client = getS3Client();
  if (!s3Client) return;

  const BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;
  const path = `bookings/${data.id || Date.now()}.json`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  });

  await s3Client.send(command);
};

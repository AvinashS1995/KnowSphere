import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
  region: config.aws.region,
  endpoint: config.aws.endpoint || undefined,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  },
  forcePathStyle: !!config.aws.endpoint // Required for Filebase/MinIO
});

export async function uploadToS3(
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const key = `documents/${Date.now()}-${fileName}`;
  const fileContent = fs.readFileSync(filePath);

  await s3Client.send(new PutObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
    Body: fileContent,
    ContentType: mimeType
  }));

  const url = config.aws.endpoint
    ? `${config.aws.endpoint}/${config.aws.bucketName}/${key}`
    : `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return { key, url };
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: config.aws.bucketName, Key: key }),
    { expiresIn }
  );
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: config.aws.bucketName, Key: key }));
}

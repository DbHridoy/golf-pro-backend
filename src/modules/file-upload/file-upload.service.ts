import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs";
import path from "node:path";

import { s3Client } from "@/config/aws.config";
import { env } from "@/env.js";

export async function uploadFile(filePath: string, bucketFolder = ""): Promise<string> {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const params = {
    Bucket: env.AWS_BUCKET_NAME!,
    Key: `${bucketFolder}${fileName}`,
    Body: fileContent,
    ACL: "public-read" as const, // optional
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${bucketFolder}${fileName}`;
  }
  catch (err: any) {
    throw new Error(`S3 Upload Error: ${err.message}`);
  }
}

export async function generateUploadURL(fileName: string, bucketFolder = ""): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME!,
    Key: `${bucketFolder}${fileName}`,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

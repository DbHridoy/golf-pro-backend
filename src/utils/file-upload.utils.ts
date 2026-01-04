import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "node:process";

import { bucket, s3 } from "@/config/aws.config";

class FileUploadUtils {
  uploadToS3 = async (fileContent: Buffer, key: string, contentType: string) => {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: "public-read",
      }),
    );

    return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  };
}
const fileUploadUtils = new FileUploadUtils();
export default fileUploadUtils;

// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fs from "node:fs";
// import path from "node:path";

// import { s3Client } from "@/config/aws.config";
// import { env } from "@/env.js";

// /**
//  * Uploads a file from local disk to S3 and returns the public URL.
//  */
// export async function uploadFileToS3(filePath: string, bucketFolder = "uploads/"): Promise<string> {
//   const fileContent = fs.readFileSync(filePath);
//   const fileName = path.basename(filePath);

//   const params = {
//     Bucket: env.AWS_BUCKET_NAME!,
//     Key: `${bucketFolder}${fileName}`,
//     Body: fileContent,
//     ACL: "public-read" as const,
//   };

//   try {
//     const command = new PutObjectCommand(params);
//     await s3Client.send(command);
//     return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${bucketFolder}${fileName}`;
//   } catch (err: any) {
//     throw new Error(`S3 Upload Error: ${err.message}`);
//   }
// }

// /**
//  * Generates a signed S3 upload URL for direct browser uploads.
//  */
// export async function generateS3UploadURL(fileName: string, bucketFolder = "uploads/"): Promise<string> {
//   const command = new PutObjectCommand({
//     Bucket: env.AWS_BUCKET_NAME!,
//     Key: `${bucketFolder}${fileName}`,
//   });

//   return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// }

//  uploadToS3 = async (fileContent: Buffer, key: string, contentType: string) => {
//     await s3.send(
//       new PutObjectCommand({
//         Bucket: bucket,
//         Key: key,
//         Body: fileContent,
//         ContentType: contentType,
//         ACL: "public-read",
//       }),
//     );

//     return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
//   };

// import type { FileFilterCallback, StorageEngine } from "multer";

// import multer from "multer";
// import fs from "node:fs";
// import path from "node:path";

// // Default upload directory
// const DEFAULT_UPLOAD_DIR = path.join(__dirname, "../../uploads");

// // Ensure the directory exists
// function ensureDirExists(dir: string) {
//   if (!fs.existsSync(dir))
//     fs.mkdirSync(dir, { recursive: true });
// }

// /**
//  * Create a multer upload instance for single or multiple files
//  * @param uploadDir Directory where files will be saved
//  * @param maxFiles Maximum number of files for multiple upload
//  * @param maxSize Maximum file size in bytes (default 5MB)
//  */
// export function createFileUploader(uploadDir = DEFAULT_UPLOAD_DIR, maxFiles = 10, maxSize = 5 * 1024 * 1024) {
//   ensureDirExists(uploadDir);

//   const storage: StorageEngine = multer.diskStorage({
//     destination: (_req, _file, cb) => cb(null, uploadDir),
//     filename: (_req, file, cb) => {
//       const timestamp = Date.now();
//       const ext = path.extname(file.originalname);
//       const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//       cb(null, `${name}_${timestamp}${ext}`);
//     },
//   });

//   const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     if (allowedTypes.test(file.mimetype))
//       cb(null, true);
//     else cb(new Error("Invalid file type. Only images are allowed."));
//   };

//   const upload = multer({
//     storage,
//     limits: { fileSize: maxSize },
//     fileFilter,
//   });

//   return {
//     single: (fieldName: string) => upload.single(fieldName),
//     multiple: (fieldName: string) => upload.array(fieldName, maxFiles),
//   };
// }

// /**
//  * Helper to get full path of a file
//  */
// export function getFilePath(filename: string, uploadDir = DEFAULT_UPLOAD_DIR) {
//   return path.join(uploadDir, filename);
// }

// local file upload for testing
// import type { Request } from "express";
// import type { FileFilterCallback, StorageEngine } from "multer";

// import multer from "multer";
// import fs from "node:fs";
// import path from "node:path";

// const DEFAULT_UPLOAD_DIR = path.join(__dirname, "../uploads");

// function ensureDirExists(dir: string) {
//   if (!fs.existsSync(dir))
//     fs.mkdirSync(dir, { recursive: true });
// }

// function getUploaderConfig(uploadDir = DEFAULT_UPLOAD_DIR, maxSize = 5 * 1024 * 1024) {
//   ensureDirExists(uploadDir);

//   const storage: StorageEngine = multer.diskStorage({
//     destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//       cb(null, uploadDir); // ✅ destination must be string, not optional
//     },
//     filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//       const timestamp = Date.now();
//       const ext = path.extname(file.originalname);
//       const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//       cb(null, `${name}_${timestamp}${ext}`); // ✅ filename must be string
//     },
//   });

//   const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     if (allowedTypes.test(file.mimetype))
//       cb(null, true);
//     else cb(new Error("Invalid file type. Only images are allowed."));
//   };

//   return { storage, fileFilter, limits: { fileSize: maxSize } };
// }

// export function createFileUploader(uploadDir = DEFAULT_UPLOAD_DIR, maxFiles = 10, maxSize = 5 * 1024 * 1024) {
//   const { storage, fileFilter, limits } = getUploaderConfig(uploadDir, maxSize);
//   const upload = multer({ storage, fileFilter, limits });

//   return {
//     single: (fieldName: string) => upload.single(fieldName),
//     multiple: (fieldName: string) => upload.array(fieldName, maxFiles),
//     fields: (fields: { name: string; maxCount: number }[]) => upload.fields(fields),
//   };
// }

// export function getFilePath(filename: string, uploadDir = DEFAULT_UPLOAD_DIR) {
//   return path.join(uploadDir, filename);
// }

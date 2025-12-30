import multer from "multer";

import { createFileUploader } from "@/utils/file-upload.utils";

/**
 * Handles multiple fields with separate keys
 */
export function uploaderMultipleFields(fields: { name: string; maxCount: number }[]) {
  const { storage, fileFilter, limits } = getFileUploaderStorage();
  return multer({ storage, fileFilter, limits }).fields(fields);
}

/**
 * Extract storage, fileFilter, and limits from createFileUploader
 */
function getFileUploaderStorage() {
  const uploader = createFileUploader(); // use default params
  // Hack: access internal multer options by creating a temporary multer instance
  // TypeScript can't extract storage directly, so redefine here
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "../../uploads"),
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const ext = file.originalname.split(".").pop();
      const name = file.originalname.replace(/\s+/g, "_");
      cb(null, `${name}_${timestamp}.${ext}`);
    },
  });

  const fileFilter: multer.FileFilterCallback = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    if (allowedTypes.test(file.mimetype))
      cb(null, true);
    else cb(new Error("Invalid file type. Only images are allowed."));
  };

  const limits = { fileSize: 5 * 1024 * 1024 };

  return { storage, fileFilter, limits };
}

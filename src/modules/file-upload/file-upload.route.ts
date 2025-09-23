import express from "express";
import multer from "multer";

import { generateURLController, uploadFileController } from "@/modules/file-upload/file-upload.controller";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/upload", upload.single("file"), uploadFileController);
router.post("/generate-url", generateURLController);

export default router;

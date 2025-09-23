import type { Request, Response } from "express";

import { generateUploadURL, uploadFile } from "@/modules/file-upload/file-upload.service";

export async function uploadFileController(req: Request, res: Response) {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file provided" });
    const fileUrl = await uploadFile(req.file.path, "uploads/");
    res.status(200).json({ fileUrl });
  }
  catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function generateURLController(req: Request, res: Response) {
  try {
    const { fileName } = req.body;
    const url = await generateUploadURL(fileName, "uploads/");
    res.status(200).json({ url });
  }
  catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

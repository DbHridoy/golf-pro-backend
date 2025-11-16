import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { messageService } from "./message.services";

// message.routes.ts
const router = Router();
router.get(
  "/messages/:convId",
  authMiddleware.authenticate,
  async (req, res) => {
    const msgs = await messageService.getByConversation(req.params.convId);
    res.json({ success: true, data: msgs.reverse() });
  },
);
export default router;

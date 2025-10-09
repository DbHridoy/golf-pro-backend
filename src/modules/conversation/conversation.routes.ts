import express from "express";

import { authMiddleware } from "@/middlewares/jwt-auth.middleware.js";

import ConversationController from "./conversation.controller";

const router = express.Router();

router.get(
  "/get-chat-list",
  authMiddleware.authenticate,
  ConversationController.getChatList,
);

export default router;

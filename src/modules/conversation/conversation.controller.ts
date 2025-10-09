import type { RequestHandler } from "express";

import httpStatus from "http-status";

import catchAsync from "../../utility/catchAsync.js";
import sendResponse from "../../utility/sendRespone.js";
import ConversationService from "./conversation.services";

const getChatList: RequestHandler = catchAsync(async (req, res) => {
  const result = await ConversationService.getConversation(
    req?.user?.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation retrieved successfully",
    data: result,
  });
});

const ConversationController = {
  getChatList,
};

export default ConversationController;

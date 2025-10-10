import { Router } from "express";

import { channelController } from "./channel.controller";

const router = Router();

router.post("/create-channel", channelController.createChannel);
router.get("/get-channel/:id", channelController.getChannel);
router.get("/get-all-channels", channelController.getAllChannels);
router.patch("/update-channel/:id", channelController.updateChannel);
router.delete("/delete-channel/:id", channelController.deleteChannel);

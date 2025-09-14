import { Router } from "express";

import { userController } from "./user.controller";

const router = Router();

// User management routes (TODO: Add authentication middleware)
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.patch("/:id/change-password", userController.changePassword);

export default router;

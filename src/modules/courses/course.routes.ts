// file: src/routes/course.routes.ts

import express from "express";

import { authMiddleware } from "@/middlewares/auth.middleware.js";

import {
  getCourseDetails,
  getLocalCourses,
  searchCourses,
} from "./course.controller.js";

const router = express.Router();

router.use(authMiddleware.authenticate);

// Search courses from Golf API
router.get("/courses/search", searchCourses);

// Get single course details
router.get("/courses/:courseID", getCourseDetails);

// Get previously played courses from local database
router.get("/courses/local", getLocalCourses);

export default router;

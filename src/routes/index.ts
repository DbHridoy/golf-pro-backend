import express from "express";

import authRouter from "@/modules/auth/auth.route";
import channelRouter from "@/modules/channel/channel.route";
import commentsRouter from "@/modules/comments/comments.route";
import dashboardRouter from "@/modules/dashboard/dashboard.route";
import friendsRouter from "@/modules/friends/friends.route";
import golferRouter from "@/modules/golfer/golfer.route";
import likesRouter from "@/modules/likes/likes.route";
import membershipRouter from "@/modules/memberships/memberships.route";
import notificationRouter from "@/modules/notification/notification.route";
import postsRouter from "@/modules/posts/posts.route";
import userRouter from "@/modules/user/user.route";

import docsRouter from "./docs.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/docs",
    route: docsRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/users",
    route: userRouter,
  },
  {
    path: "/golfer",
    route: golferRouter,
  },
  {
    path: "/posts",
    route: postsRouter,
  },
  {
    path: "/likes",
    route: likesRouter,
  },
  {
    path: "/comments",
    route: commentsRouter,
  },
  {
    path: "/friends",
    route: friendsRouter,
  },
  {
    path: "/send-push-notification",
    route: notificationRouter,
  },
  {
    path: "/dashboard",
    route: dashboardRouter,
  },
  {
    path: "/channel",
    route: channelRouter,
  },
  {
    path: "/membership",
    route: membershipRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;

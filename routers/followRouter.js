const express = require("express");
const {
  followUserController,
  getFollowingListController,
  getFollowerListController,
  unfollowUserController,
} = require("../controllers/followController");

const followRouter = express.Router();

followRouter
  .post("/follow-user", followUserController)
  .get("/get-followingList", getFollowingListController)
  .get("/get-followerList", getFollowerListController)
  .post("/unfollow-user", unfollowUserController);

module.exports = followRouter;

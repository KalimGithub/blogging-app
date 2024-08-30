const {
  followUser,
  getFollowingList,
  unfollowUser,
  getFollowerList,
} = require("../models/followModel");
const User = require("../models/userModel");

const followUserController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  try {
    await User.findUserWithKey({ key: followerUserId });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Invalid follower User Id",
      error: error,
    });
  }
  try {
    await User.findUserWithKey({ key: followingUserId });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Invalid following User Id",
      error: error,
    });
  }

  try {
    const followDb = await followUser({ followerUserId, followingUserId });
    return res.send({
      status: 201,
      message: "Follow success",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Iternal server error",
      error: error,
    });
  }
};

const getFollowingListController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;

  try {
    await User.findUserWithKey({ key: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid follower User Id",
      error: error,
    });
  }

  try {
    const followingListDb = await getFollowingList({ followerUserId, SKIP });

    if (followingListDb.length === 0)
      return res.send({
        status: 203,
        message: "No Following found",
      });

    return res.send({
      status: 200,
      message: "Read Success",
      data: followingListDb,
    });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Internal server error",
      error: error,
    });
  }
};

const getFollowerListController = async (req, res) => {
  const followingUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;

  try {
    await User.findUserWithKey({ key: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid following User Id",
      error: error,
    });
  }

  try {
    const followerListDb = await getFollowerList({ followingUserId, SKIP });
    if (followerListDb.length === 0)
      return res.send({
        status: 203,
        message: "No Followers found",
      });

    return res.send({
      status: 200,
      message: "Read Success",
      data: followerListDb,
    });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Internal server error",
      error: error,
    });
  }
};

//unfollow controller
const unfollowUserController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  try {
    const deleteDb = await unfollowUser({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: "Unfollow Success",
      data: deleteDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Iternal server error",
      error: error,
    });
  }
};

module.exports = {
  followUserController,
  getFollowingListController,
  getFollowerListController,
  unfollowUserController,
};

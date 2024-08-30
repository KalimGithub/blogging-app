const {
  createBlog,
  getBlogs,
  getMyBlogs,
  getBlogWithId,
  editBlogWithId,
  deleteBlogWithId,
} = require("../models/blogModel");
const { getFollowingList } = require("../models/followModel");
const blogDataValidate = require("../utils/blogUtils");

const createBlogController = async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  console.log(userId);

  // data validation
  try {
    await blogDataValidate({ title, textBody });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  // store data in the DB
  try {
    const blogDb = await createBlog({ title, textBody, userId });
    return res.send({
      status: 201,
      message: "Blog created successfully",
      data: blogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const getBlogsController = async (req, res) => {
  const SKIP = Number(req.query.skip) || 0;
  const followerUserId = req.session.user.userId;
  try {
    const follwingUserList = await getFollowingList({ followerUserId, SKIP });

    const followingUserIds = follwingUserList.map((item) => item._id);

    const blogsDb = await getBlogs({ followingUserIds, SKIP });

    if (blogsDb.length === 0) {
      return res.send({
        status: 204,
        message: "No Blogs Found",
      });
    }

    return res.send({
      status: 200,
      message: "Read Success",
      data: blogsDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const getMyBlogsController = async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const SKIP = parseInt(req.query.skip) || 0;

    const myBlogsDb = await getMyBlogs({ SKIP, userId });
    if (myBlogsDb.length === 0) {
      return res.send({
        status: 204,
        message: "No Blogs Found",
      });
    }
    return res.send({
      status: 200,
      message: "Read Success",
      data: myBlogsDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const editBlogController = async (req, res) => {
  const { title, textBody, blogId } = req.body;
  const userId = req.session.user.userId;

  //data validation
  try {
    await blogDataValidate({ title, textBody });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  // find the blog
  try {
    const blogDb = await getBlogWithId({ blogId });

    // ownership check

    //objectId is a datatype in mongodb it cannot check directly we have to use other method to check
    //1) ---> blogDb.userId.tostring() === userId.tostring()
    //2) ---> blogDb.userId.equals(userId)
    // console.log(blogDb.userId.equals(userId));
    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 403,
        message: "Not allowed to edit this blog",
      });
    }

    // check time of blog created
    // console.log((Date.now() - blogDb.creationDateTime) / (1000 * 60));

    const diff = (Date.now() - blogDb.creationDateTime) / (1000 * 60);
    if (diff > 30) {
      return res.send({
        status: 400,
        message: "Not allowed to edit blog after 30 mins of creation time",
      });
    }

    const newBlogDb = await editBlogWithId({ blogId, title, textBody });
    return res.send({
      status: 200,
      message: "Blog updated successfully",
      data: newBlogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal Server error",
      error: error,
    });
  }
};

const deleteBlogController = async (req, res) => {
  const blogId = req.body.blogId;
  const userId = req.session.user.userId;

  try {
    const blogDb = await getBlogWithId({ blogId });
    //ownership check
    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 403,
        message: "Not allowed to delete this blog",
      });
    }

    const deletedBlogDb = await deleteBlogWithId({ blogId });
    return res.send({
      status: 200,
      message: "Blog deleted successfully",
      data: deletedBlogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal Server error",
      error: error,
    });
  }
};
module.exports = {
  createBlogController,
  getBlogsController,
  getMyBlogsController,
  editBlogController,
  deleteBlogController,
};

const { LIMIT } = require("../privateConstraints");
const blogSchema = require("../schemas/blogSchema");
const objectId = require("mongodb").ObjectId;

const createBlog = ({ title, textBody, userId }) => {
  return new Promise(async (resolve, reject) => {
    const blogObj = new blogSchema({
      title,
      textBody,
      userId,
      creationDateTime: Date.now(),
    });
    try {
      const blogDb = await blogObj.save();
      resolve(blogDb);
    } catch (error) {
      reject(error);
    }
  });
};

const getBlogs = ({ followingUserIds, SKIP }) => {
  // console.log(follwingUserList);

  return new Promise(async (resolve, reject) => {
    try {
      const blogsDb = await blogSchema.aggregate([
        {
          $match: {
            userId: { $in: followingUserIds },
            isDeleted: { $ne: true },
          },
        },
        { $sort: { creationDateTime: -1 } }, // -1 -> DESC, +1 -> ASC
        { $skip: SKIP },
        { $limit: LIMIT },
      ]);

      if (SKIP > 0 && blogsDb.length === 0) {
        const blogsDbOther = await blogSchema.aggregate([
          {
            $match: {
              userId: { $nin: followingUserIds },
              isDeleted: { $ne: true },
            },
          },
          { $sort: { creationDateTime: -1 } }, // -1 -> DESC, +1 -> ASC
          { $skip: SKIP },
          { $limit: LIMIT },
        ]);
        resolve(blogsDbOther);
      }

      resolve(blogsDb);
    } catch (error) {
      reject(error);
    }
  });
};

const getMyBlogs = ({ SKIP, userId }) => {
  return new Promise(async (resolve, reject) => {
    //match, sort, skip, limit

    try {
      const myBlogsDb = await blogSchema.aggregate([
        { $match: { userId: userId, isDeleted: { $ne: true } } }, // isDeleted:{ $eq:false }
        { $sort: { creationDateTime: 1 } },
        { $skip: SKIP },
        { $limit: LIMIT },
      ]);
      resolve(myBlogsDb);
    } catch (error) {
      reject(error);
    }
  });
};

const getBlogWithId = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    if (!blogId) reject("Missing Blog ID");
    if (!objectId.isValid(blogId)) reject("Incorrect format of BlogId");

    try {
      const blogDb = await blogSchema.findOne({ _id: blogId });

      if (!blogDb) reject(`Blog is not found with this blogId: ${blogId}`);
      resolve(blogDb);
    } catch (error) {
      reject(error);
    }
  });
};

const editBlogWithId = ({ title, textBody, blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newBlogDb = await blogSchema.findByIdAndUpdate(
        { _id: blogId },
        { title: title, textBody: textBody },
        { new: true } // new:true return new updated data
      );
      // console.log(newBlogDb);
      resolve(newBlogDb);
    } catch (error) {
      reject(error);
    }
  });
};
const deleteBlogWithId = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const blogDb = await blogSchema.findOneAndDelete({ _id: blogId });
      const blogDb = await blogSchema.findOneAndUpdate(
        { _id: blogId },
        { isDeleted: true, deletionDateTime: Date.now() }
      );
      resolve(blogDb);
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  createBlog,
  getBlogs,
  getMyBlogs,
  getBlogWithId,
  editBlogWithId,
  deleteBlogWithId,
};

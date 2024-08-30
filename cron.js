var cron = require("node-cron");
const blogSchema = require("./schemas/blogSchema");

const cleanUpBin = () => {
  cron.schedule("* * 0 * * *", async () => {
    // console.log("cron is running");

    try {
      // find all the blogs which marked as deleted
      const markedDeletedBlogs = await blogSchema.find({ isDeleted: true });
      // console.log(markedDeletedBlogs);
      if (markedDeletedBlogs.length !== 0) {
        let deletedBlogIds = [];
        markedDeletedBlogs.map((blog) => {
          // find deletion time
          // console.log((Date.now() - blog.deletionDateTime) / (1000 * 60));
          const diff =
            (Date.now() - blog.deletionDateTime) / (1000 * 60 * 60 * 24);
          // find diff of time deleted and current time if diff > 30
          if (diff > 30) {
            deletedBlogIds.push(blog._id);
          }
        });
        //delete permanantly
        if (deletedBlogIds.length !== 0) {
          const deleteDb = await blogSchema.findOneAndDelete({
            _id: { $in: deletedBlogIds },
          });
          console.log(`Blog has been deleted successfully : ${deleteDb._id}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = cleanUpBin;

const blogDataValidate = ({ title, textBody }) => {
  return new Promise((resolve, reject) => {
    if (!title || !textBody) reject("Missing Blog Data");

    if (typeof title !== "string") reject("Blog Title is not a Text");
    if (typeof textBody !== "string") reject("Text Body is not a text");

    resolve();
  });
};
module.exports = blogDataValidate;

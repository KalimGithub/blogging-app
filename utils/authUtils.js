function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

const userDataValidation = ({ email, username, password }) => {
  return new Promise((resolve, reject) => {
    if (!email || !password || !username) {
      reject("Missing credentials Please fill all fields");
    }

    if (typeof email !== "string") reject("Email is not a text");
    if (typeof username !== "string") reject("Username is not a text");
    if (typeof password !== "string") reject("Password is not a text");

    if (username.length < 3 || username.length > 100) {
      reject("Username must be between 3 and 100 characters");
    }
    if (!isValidEmail(email)) reject("Email is not formatted");
    resolve();
  });
};

module.exports = { userDataValidation, isValidEmail };

const userSchema = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;

const User = class {
  constructor({ name, username, email, password }) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      // console.log(this.name, this.email);

      // checking if email and username is exists or not
      const userExists = await userSchema.findOne({
        $or: [{ email: this.email }, { username: this.username }],
      });
      // email already exists
      if (userExists && userExists.email === this.email) {
        reject("Email already exists");
      }
      // username already exists
      if (userExists && userExists.username === this.username) {
        reject("Username already exists");
      }
      // hashed password
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT)
      );
      // storing data in db
      const user = new userSchema({
        name: this.name,
        username: this.username,
        email: this.email,
        password: hashedPassword,
      });

      try {
        const userDb = await user.save();
        resolve(userDb);
      } catch (error) {
        reject(error);
      }

      resolve();
    });
  }

  static findUserWithKey({ key }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await userSchema
          .findOne({
            $or: [
              ObjectId.isValid(key) ? { _id: key } : { email: key },
              { username: key },
            ],
          })
          .select("+password");
        if (!userDb) reject("User not found");
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = User;

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { userDataValidation } = require("../utils/authUtils");

const registerController = async (req, res) => {
  console.log(req.body);
  const { name, email, password, username } = req.body;
  try {
    await userDataValidation({ name, email, password, username });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data invalid",
      error: error,
    });
  }

  const userModelObj = new User({ name, username, email, password });

  try {
    const userDb = await userModelObj.registerUser();
    return res.send({
      status: 201,
      message: "User Registered successfully",
      data: userDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "internal server error",
      error: error,
    });
  }
};

const loginController = async (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "Missing login credentials",
    });
  }
  if (typeof loginId !== "string") {
    return res.send({
      status: 400,
      message: "loginId is not a string",
    });
  }
  if (typeof password !== "string") {
    return res.send({
      status: 400,
      message: "password is not a string",
    });
  }
  try {
    const userDb = await User.findUserWithKey({ key: loginId });
    console.log(userDb);

    // password matching
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) {
      return res.send({
        status: 400,
        message: "Incorrect password",
      });
    }

    // console.log(req.session)

    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      username: userDb.username,
      email: userDb.email,
    };

    // login successful
    return res.send({
      status: 200,
      message: "Login Successful",
      data: userDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal Server Error",
      error: error,
    });
  }
};

const logoutController = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send({
        status: 400,
        message: "Logout unsuccessfull",
        error: err,
      });
    } else {
      return res.send({
        status: 200,
        message: "Logout successfull",
      });
    }
  });
};

module.exports = { registerController, loginController, logoutController };

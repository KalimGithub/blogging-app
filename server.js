const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);

//file imports
require("./db");
const authRouter = require("./routers/authRouter");
const blogRouter = require("./routers/blogRouter");
const isAuth = require("./middlewares/isAuthMiddleware");
const followRouter = require("./routers/followRouter");
const cleanUpBin = require("./cron");

// constants
const app = express();
const PORT = process.env.PORT;
const store = new mongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
// middlewares
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authRouter);
app.use("/blog", blogRouter);
app.use("/follow", isAuth, followRouter);

// app.get("/", (req, res) => {
//   return res.send({
//     status: 200,
//     message: "server is running",
//   });
// });

// making server as a listener
app.listen(PORT, () => {
  console.log(
    clc.yellow.bold.underline(`server is running on: http://localhost:${PORT}`)
  );
  cleanUpBin();
});

// api ---> router ----> controller -----> model ------>DB

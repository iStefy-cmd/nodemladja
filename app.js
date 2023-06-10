const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const socket = require("./socket");

const MongoDBStore = require("connect-mongodb-session")(session);
const MONGO_URI =
  "mongodb+srv://stefan:Sundjerbub9@cluster0.a5dbfdc.mongodb.net/management";

const csrfProtection = csrf();

const User = require("./models/user");
const path = require("path");
const app = express();
const store = MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "letmein",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3 * 60 * 1000,
    },
    store: store,
  })
);
app.use(csrfProtection);
app.use((req, res, next) => {
  // const io = require("socket.io-client");
  // const socket = io("http://localhost:3000");

  // // Replace "http://example.com" with your server URL

  // socket.on("connect", () => {
  //   console.log("Connected to server");
  // });

  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next();
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;

  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((err, req, res, next) => {
  if (err && err.code === "EBADCSRFTOKEN") {
    // CSRF token validation failed, handle the error here
    console.log("greska u csrf");

    res.redirect("/login");
  } else {
    next(err);
  }
});

app.use("/admin", adminRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", (req, res, next) => {
  if (req.session.isAdmin) return res.redirect("/admin/allUsers");
  if (!req.session.isAdmin && req.session.user) return res.redirect("/main");
  res.redirect("/login");
});

mongoose
  .connect(MONGO_URI)
  .then((res) => {
    const server = app.listen(3000);
    socket.init(server).on("connection", () => {
      console.log("connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });

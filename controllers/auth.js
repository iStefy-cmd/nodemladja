const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {});
};
exports.postLogin = (req, res, next) => {
  req.session.cookie.expires = new Date(Date.now() + 3 * 60 * 1000);
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("ne valja user");
        return res.redirect("/login");
      }

      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.user = user;
          req.session.isLoggedIn = true;
          console.log("logged IN");
          return res.redirect("/main");
        } else {
          console.log("ne valja sifra");

          return res.redirect("/login");
        }
      });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {});
};
exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  User.findOne({ $or: [{ email: email }, { name: name }] })
    .then((user) => {
      if (user) {
        res.redirect("/login");
        throw new Error("korisnik vec postoji");
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPw) => {
          const user = new User({
            email: email,
            password: hashedPw,
            name: name,
            transactions: [],
            debt: 0,
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((er) => {
          console.log(er);
        });
    })
    .catch((er) => {
      console.log(er);
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("logout-ed");
    res.redirect("/login");
  });
};
exports.getAdminLogin = (req, res, next) => {
  res.render("admin/login");
};

exports.postAdminLogin = (req, res, next) => {
  req.session.cookie.expires = new Date(Date.now() + 3 * 60 * 1000);
  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("ne valja user");
        return res.redirect("/admin-login");
      }

      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.user = user;
          req.session.isLoggedIn = true;
          req.session.isAdmin = true;
          console.log("logged IN as Admin");

          return res.redirect("admin/allUsers");
        } else {
          console.log("ne valja sifra");

          res.redirect("/admin-login");
        }
      });
    })
    .catch((er) => {
      console.log(er);
    });
};

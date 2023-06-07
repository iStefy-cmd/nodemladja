const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {});
};
exports.postLogin = (req, res, next) => {
  req.session.cookie.expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
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

exports.getAuthInfoChange = (req, res, next) => {
  res.render("auth/auth-info-change", {});
};
exports.postAuthInfoChange = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const newPassword = req.body.newpassword;
  const newPasswordConfirmation = req.body.newpasswordconfirmation;

  if (newPassword === newPasswordConfirmation) {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        res.redirect("/auth-info-change");
        throw new Error("korisnik ne postoji");
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          bcrypt.hash(newPassword, 12).then((hashedPw) => {
            user.password = hashedPw;
            if (req.body.newemail !== "") {
              User.find({ email: req.body.newemail }).then((user1) => {
                if (!user1[0]) {
                  user.email = req.body.newemail;
                  user
                    .save()
                    .then(() => {
                      console.log("info successfully changed");
                      return res.redirect("login");
                    })
                    .catch((er) => {
                      console.log(er);
                    });
                  // ADMIN PRETRAGA, ZA SAD ISKLJUCENA DA NE BI SLALO DODATAN REQUEST BEZVEZE
                  // Admin.find({ email: email }).then((admin) => {
                  //   if (!admin[0]) {
                  //     user.email = req.body.newemail;
                  //     user
                  //       .save()
                  //       .then(() => {
                  //         console.log("info successfully changed");
                  //         return res.redirect("login");
                  //       })
                  //       .catch((er) => {
                  //         console.log(er);
                  //       });
                  //   }
                  // });
                } else {
                  console.log("email je zauzet, pokusajte sa drugim" + user1);
                  return res.redirect("auth-info-change");
                }
              });
            } else {
              user
                .save()
                .then(() => {
                  console.log("info successfully changed");
                  return res.redirect("login");
                })
                .catch((er) => {
                  console.log(er);
                });
            }
          });
        } else {
          console.log("ne valja email");
          return res.redirect("/auth-info-change");
        }
      });
    });
  }
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
  req.session.cookie.expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
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

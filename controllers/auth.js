const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const crypto = require("crypto");
const { use } = require("../routes/admin");
const encodedPath = encodeURIComponent("/path/with/special@characters");
const url = `sandbox9294e28aaf224191ad15b53c748421e3.mailgun.org`;
const mailgun = require("mailgun-js")({
  apiKey: "eb534d910a3482771e385880fdefc5f2-6d1c649a-09df90ea",
  domain: url,
});

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
exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset");
};
exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);

      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          console.log("no user with this email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        console.log(`Reset link http://localhost:3000/reset/${token}`);

        // const emailData = {
        //   from: "Agriculture Management <agriculture@support.com>",
        //   to: req.body.email,
        //   subject: "Password Reset Request",
        //   html: `<p>Click on this link to reset password <a href="http://localhost:3000/reset/${token}">Reset</a></p>`,
        // };
        // mailgun.messages().send(emailData, (error, body) => {
        //   if (error) {
        //     console.error("Error sending email:", error);
        //   } else {
        //     console.log("Email sent successfully!");
        //   }
        // });
      })
      .catch((er) => {
        console.log(er);
      });
  });
};
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) return res.redirect("/reset");

      res.render("auth/new-password", {
        userID: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const newPasswordConfirmed = req.body.passwordConfirmed;
  const userID = req.body.userID;
  const passwordToken = req.body.passwordToken;
  let userVar;
  if (newPassword === newPasswordConfirmed) {
    User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userID,
    })
      .then((user) => {
        if (!user) {
          console.log("Nema usera, doslo je do greske ili je istekao token");
          return res.redirect("/reset");
        }
        userVar = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then((hashedPw) => {
        userVar.password = hashedPw;
        userVar.resetToken = undefined;
        userVar.resetTokenExpiration = undefined;
        return userVar.save();
      })
      .then((result) => {
        console.log("uspesno promenjena sifra");

        return res.redirect("/login");
      })
      .catch((er) => {
        console.log(er);
      });
  } else {
    console.log("sifre moraju biti iste");
    res.redirect("/reset");
  }
};

const User = require("../models/user");

const Transaction = require("../models/transaction");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

exports.getMainPage = async (req, res, next) => {
  const users = await User.find();
  const currentAdmin = await Admin.findOne({ _id: req.session.user._id });
  const requests = currentAdmin.requests;
  res.render("../views/admin/mainPage", {
    names: users.map((u) => u.name),
    requests,
  });
};

exports.getUserInfo = async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const name = req.params.userName;

  try {
    const [user] = await User.find({ name: name });

    const trans = await Transaction.find({ userID: user._id });

    function groupTransactions(transactions) {
      const groupedTransactions = {};

      // Iterate through all transactions
      transactions.forEach((transaction) => {
        const { name } = transaction;
        const debt = transaction.quantity * transaction.price;
        const date = new Date(transaction.createdAt).toLocaleDateString(
          "sr-Latn-RS",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          }
        );
        const deposit = transaction.deposit;
        const description = transaction.description;
        const quantity = transaction.quantity;
        const price = transaction.price;
        const type = transaction.type;
        const transactionID = transaction._id;
        // If there is no object for that date, create it
        if (!groupedTransactions[date]) {
          groupedTransactions[date] = {
            transactions: [],
            totalDebt: 0,
          };
        }

        // Add the current transaction to the object for that date
        groupedTransactions[date].transactions.push({
          name,
          debt,
          price,
          quantity,
          type,
          transactionID,
          description,
          deposit,
        });

        // Add the debt of the current transaction to the total debt for that date
        groupedTransactions[date].totalDebt += debt;
      });

      return groupedTransactions;
    }

    // Group transactions
    const groupedTransactions = groupTransactions(trans);
    res.render("admin/user-info", {
      user: user,
      transactionsGrouped: groupedTransactions,
      errors: "good",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllTransactions = (req, res, next) => {
  function groupTransactions(transactions) {
    const groupedTransactions = {};

    transactions.forEach((transaction) => {
      const { name, price, quantity, type } = transaction;
      const debt = quantity * price;
      const deposit = transaction.deposit;
      const description = transaction.description;
      const date = new Date(transaction.createdAt).toLocaleDateString(
        "sr-Latn-RS",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        }
      );
      const unConvertedDate = new Date(transaction.createdAt);

      if (!groupedTransactions[date]) {
        groupedTransactions[date] = {
          transactions: [],
        };
      }

      groupedTransactions[date].transactions.push({
        name,
        date,
        price,
        quantity,
        debt,
        type,
        deposit,
        description,
        unConvertedDate,
      });
    });

    return groupedTransactions;
  }

  // Group transactions
  Transaction.find().then((result) => {
    if (!result) {
      return res.redirect("../views/admin/mainPage");
    }
    const groupedTransactions = groupTransactions(result);
    const dates = Object.keys(groupedTransactions);
    const data = {};

    dates.forEach((date) => {
      data[date] = groupedTransactions[date].transactions;
    });
    res.render("../views/admin/all-transactions-admin", {
      alltransactions: result,
      dates: dates,
      data: data,
    });
  });
};
exports.postDeleteRequest = (req, res, next) => {
  const userID = req.query.userID;
  const transactionID = req.query.transactionID;
  let finalDebt;
  let transactions;
  User.find({ _id: userID })
    .then((us) => {
      const currentTransaction = us[0].transactions.filter(
        (t) => t.transactionID.toString() === transactionID.toString()
      );
      us[0].transactions = us[0].transactions.filter(
        (t) => t.transactionID.toString() !== transactionID.toString()
      );

      const debt = currentTransaction[0].price * currentTransaction[0].quantity;
      finalDebt = us[0].debt - debt;

      us[0].debt = finalDebt;
      transactions = us[0].transactions;
      return us[0].save();
    })
    .then((result) => {
      Transaction.deleteOne({ _id: transactionID }).then(() => {
        if (!transactions[0]) {
          User.findByIdAndDelete(userID).then(() => {
            return res.status(200).json({
              message: "deleted profile successfully",
              debt: finalDebt,
            });
          });
        } else {
          return res
            .status(200)
            .json({ message: "deleted successfully", debt: finalDebt });
        }
      });
    })
    .catch((er) => {
      console.log(er);
    });
};
exports.postAddTransaction = (req, res, next) => {
  if (req.body.deposit) {
    if (isNaN(req.body.deposit)) {
      return res.render(`error/number`);
    }

    const name = req.body.name;
    const type = "uplata";
    const quantity = -req.body.deposit;
    const price = 1;
    const description = req.body.description;
    const deposit = -req.body.deposit;

    User.findOne({ name: name })
      .then((res) => {
        let userID = res ? res._id : "";
        let user = res ? res : "";
        if (!res) {
          return res.redirect("admin");
        }

        const transaction = new Transaction({
          name: name,
          type: type,
          quantity: quantity,
          price: price,
          userID: userID,
          description: description,
          deposit: deposit,
        });

        user.transactions.push({
          type: type,
          quantity: quantity,
          price: price,
          description: description,
          deposit: deposit,
          transactionID: transaction._id,
        });
        user.debt += deposit;

        return user
          .save()
          .then((res1) => {
            return transaction.save();
          })
          .catch((res12) => {
            console.log("transakcija se nije sacuvala u svim transakcijama");
          });
      })
      .then((result) => {
        // console.log(result);

        if (req.body.isLocal == "true")
          return res.redirect("/admin/user/" + name);
        return res.redirect("/admin/allUsers");
      })
      .catch((er) => {
        console.log(er);
      });
  } else {
    const name = req.body.name;
    const type = req.body.type;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const description = "notdeposit";
    const deposit = 0;
    if (isNaN(quantity) || isNaN(price)) return res.render(`error/number`);

    User.findOne({ name: name })
      .then((res) => {
        let userID = res ? res._id : "";
        let user = res ? res : "";
        if (!res) {
          bcrypt
            .hash(`${name.replace(" ", "").toLowerCase()}`, 12)
            .then((hashedPw) => {
              user = new User({
                email: `${name.trim().toLowerCase().slice(-2)}email${name
                  .trim()
                  .toLowerCase()
                  .slice(0, 2)}@email.com`,
                password: hashedPw,
                name: name,
                transactions: [],
                debt: 0,
              });
              userID = user._id;
              const transaction = new Transaction({
                name: name,
                type: type,
                quantity: quantity,
                price: price,
                deposit: deposit,
                description: description,
                userID: userID,
              });

              user.transactions.push({
                type: type,
                quantity: quantity,
                price: price,
                transactionID: transaction._id,
              });
              user.debt += price * quantity;

              user
                .save()
                .then((res1) => {
                  return transaction.save();
                })
                .catch((res) => {
                  return user.deleteOne({ _id: userID });
                });
            });
        } else {
          const transaction = new Transaction({
            name: name,
            type: type,
            quantity: quantity,
            price: price,
            deposit: deposit,
            description: description,
            userID: userID,
          });

          user.transactions.push({
            type: type,
            quantity: quantity,
            price: price,
            transactionID: transaction._id,
          });
          user.debt += price * quantity;

          return user
            .save()
            .then((res1) => {
              return transaction.save();
            })
            .catch((res) => {
              return user.deleteOne({ _id: userID });
            });
        }
      })
      .then((result) => {
        // console.log(result);
        if (req.body.isLocal == "true")
          return res.redirect("/admin/user/" + name);
        return res.redirect("/admin/allUsers");
      })
      .catch((er) => {
        console.log(er);
      });
  }
};
exports.postDeleteProfile = (req, res, next) => {
  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        console.log("OBUSTAVLJAJ");
        return res.redirect("/admin/allUsers");
      }
      return Transaction.deleteMany({ userID: id });
    })
    .then((resu) => {
      res.redirect("admin/allUsers");
    })
    .catch((er) => {
      console.log(er);
    });
};
exports.postApproveTransaction = async (req, res, next) => {
  try {
    let name = req.query.name;
    let deposit = +req.query.deposit;
    let description = req.query.description;
    let price = +req.query.price;
    let quantity = +req.query.quantity;
    let type = req.query.type;
    let userID = req.query.userID;
    let transactionID = req.query.transactionID;

    const admin = await Admin.findOne({ _id: req.session.user._id });
    const user = await User.findOne({ _id: userID });
    admin.requests = admin.requests.filter(
      (t) => t._id.toString() !== transactionID
    );
    //////////////////
    await admin.save();
    if (description != "notdeposit" && deposit != 0) {

      type = "uplata";
      quantity = deposit;
      price = 1;
      const transaction = new Transaction({
        name: name,
        type: type,
        quantity: quantity,
        price: price,
        userID: userID,
        description: description,
        deposit: deposit,
      });

      user.transactions.push({
        type: type,
        quantity: quantity,
        price: price,
        description: description,
        deposit: deposit,
        transactionID: transaction._id,
      });
      user.debt += deposit;

      await user.save();
      await transaction.save();
    } else {
    
      

      const transaction = new Transaction({
        name: name,
        type: type,
        quantity: quantity,
        price: price,
        deposit: deposit,
        description: description,
        userID: userID,
      });

      user.transactions.push({
        type: type,
        quantity: quantity,
        price: price,
        transactionID: transaction._id,
      });
      user.debt += +price * +quantity;

      await user.save();
      await transaction.save();
    }

    res.status(200).json({ message: "radi" });
  } catch (error) {
    console.log(error);
  }
};
exports.postRejectTransaction = async (req, res, next) => {
  try {
    const transactionID = req.query.transactionID;
    const admin = await Admin.findOne({ _id: req.session.user._id });

    admin.requests = admin.requests.filter(
      (t) => t._id.toString() !== transactionID
    );
    //////////////////
    await admin.save();
    res.status(200).json({ message: "rejected" });
  } catch (error) {
    console.log(error);
  }
};

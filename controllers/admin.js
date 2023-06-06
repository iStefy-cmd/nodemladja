const User = require("../models/user");

const Transaction = require("../models/transaction");
const USER_TRANSACTIONS_PER_PAGE = 2;
exports.getMainPage = (req, res, next) => {
  User.find().then((users) => {
    res.render("../views/admin/mainPage", {
      names: users.map((u) => u.name),
    });
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
        console.log("Created Product");
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

    User.findOne({ name: name })
      .then((res) => {
        let userID = res ? res._id : "";
        let user = res ? res : "";
        if (!res) {
          user = new User({
            email: "fake",
            password: "fake",
            name: name,
            transactions: [],
            debt: 0,
          });
          userID = user._id;
        }

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
      })
      .then((result) => {
        // console.log(result);
        console.log("Created Product");
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

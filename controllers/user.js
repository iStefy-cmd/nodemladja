const Transaction = require("../models/transaction");
const User = require("../models/user");
const socket = require("../socket");
// const io = require("socket.io-client");
// const socketClient = io("http://localhost:3000");
exports.getUserInfo = (req, res, next) => {
  // socketClient.on("req", (reqe) => {
  //   console.log(reqe);

  //   console.log("Connected to server");
  // });

  // socketClient.on("disconnect", () => {
  //   console.log("Disconnected from server");
  // });

  Transaction.find({ userID: req.user._id })
    .then((trans) => {
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
          const quantity = transaction.quantity;
          const price = transaction.price;
          const type = transaction.type;
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
          });

          // Add the debt of the current transaction to the total debt for that date
          groupedTransactions[date].totalDebt += debt;
        });

        return groupedTransactions;
      }

      // Group transactions
      const groupedTransactions = groupTransactions(trans);
      res.render("user/user-page", {
        user: req.user,
        transactionsGrouped: groupedTransactions,
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
        socket.getIO().emit("req", { message: "stigo", result: result });
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
        socket.getIO().emit("req", { message: "stigo", result: result });
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

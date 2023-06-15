const Transaction = require("../models/transaction");
const User = require("../models/user");
const Admin = require("../models/admin");

exports.getUserInfo = (req, res, next) => {
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
          const deposit = transaction.deposit;
          const description = transaction.description;
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
      res.render("user/user-page", {
        user: req.user,
        transactionsGrouped: groupedTransactions,
      });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.postAddTransaction = async (req, res, next) => {
  let name = req.body.name;
  let type = req.body.type;
  let quantity = req.body.quantity;
  let price = req.body.price;
  let description = req.body.description || "uplata";
  let deposit = -req.body.deposit;
  const userID = req.session.user._id;

  try {
    const admins = await Admin.find();
    if (deposit) {
      if (isNaN(deposit)) return res.render(`error/number`);
      type = "uplata";
      quantity = deposit;
      price = 1;
    } else {
      if (isNaN(quantity) || isNaN(price)) return res.render(`error/number`);
      description = "notdeposit";
      deposit = 0;
    }
    admins.forEach(async (admin) => {
      admin.requests.push({
        name: name,
        type: type,
        quantity: quantity,
        price: price,
        deposit: deposit,
        description: description,
        userID: userID,
      });
      await admin.save();
    });
    console.log("request sent " + description);

    return res.redirect("/main");
  } catch (error) {
    console.log(error);
  }
};
// Admin.find((admins) => {
//   admins.forEach((admin) => {
//     admin.requests.push({
//       name: name,
//       type: type,
//       quantity: quantity,
//       price: price,
//       deposit: deposit,
//       description: description,
//     });
//    await admin.save()
//   });
// });
// exports.postAddTransaction = (req, res, next) => {
//   if (req.body.deposit) {
//     const name = req.body.name;
//     const type = "uplata";
//     const quantity = -req.body.deposit;
//     const price = 1;
//     const description = req.body.description;
//     const deposit = -req.body.deposit;

//     User.findOne({ name: name })
//       .then((res) => {
//         let userID = res ? res._id : "";
//         let user = res ? res : "";
//         if (!res) {
//           return res.redirect("admin");
//         }

//         const transaction = new Transaction({
//           name: name,
//           type: type,
//           quantity: quantity,
//           price: price,
//           userID: userID,
//           description: description,
//           deposit: deposit,
//         });

//         user.transactions.push({
//           type: type,
//           quantity: quantity,
//           price: price,
//           description: description,
//           deposit: deposit,
//           transactionID: transaction._id,
//         });
//         user.debt += deposit;

//         return user
//           .save()
//           .then((res1) => {
//             return transaction.save();
//           })
//           .catch((res12) => {
//             console.log("transakcija se nije sacuvala u svim transakcijama");
//           });
//       })
//       .then((result) => {
//         // // console.log(result);

//         console.log("Created Product");
//         if (req.body.isLocal == "true")
//           return res.redirect("/admin/user/" + name);
//         return res.redirect("/admin/allUsers");
//       })
//       .catch((er) => {
//         console.log(er);
//       });
//   } else {
//     const name = req.body.name;
//     const type = req.body.type;
//     const quantity = req.body.quantity;
//     const price = req.body.price;
//     const description = "notdeposit";
//     const deposit = 0;
//     User.findOne({ name: name })
//       .then((res) => {
//         let userID = res ? res._id : "";
//         let user = res ? res : "";
//         if (!res) {
//           bcrypt
//             .hash(`${name.replace(" ", "").toLowerCase()}`, 12)
//             .then((hashedPw) => {
//               user = new User({
//                 email: `${name.trim().toLowerCase().slice(-2)}email${name
//                   .trim()
//                   .toLowerCase()
//                   .slice(0, 2)}@email.com`,
//                 password: hashedPw,
//                 name: name,
//                 transactions: [],
//                 debt: 0,
//               });
//               userID = user._id;
//               const transaction = new Transaction({
//                 name: name,
//                 type: type,
//                 quantity: quantity,
//                 price: price,
//                 deposit: deposit,
//                 description: description,
//                 userID: userID,
//               });

//               user.transactions.push({
//                 type: type,
//                 quantity: quantity,
//                 price: price,
//                 transactionID: transaction._id,
//               });
//               user.debt += price * quantity;

//               user
//                 .save()
//                 .then((res1) => {
//                   return transaction.save();
//                 })
//                 .then(() => {
//                   console.log("transaction saved");
//                 })
//                 .catch((res) => {
//                   return user.deleteOne({ _id: userID });
//                 });
//             });
//         } else {
//           const transaction = new Transaction({
//             name: name,
//             type: type,
//             quantity: quantity,
//             price: price,
//             deposit: deposit,
//             description: description,
//             userID: userID,
//           });

//           user.transactions.push({
//             type: type,
//             quantity: quantity,
//             price: price,
//             transactionID: transaction._id,
//           });
//           user.debt += price * quantity;

//           return user
//             .save()
//             .then((res1) => {
//               return transaction.save();
//             })
//             .catch((res) => {
//               return user.deleteOne({ _id: userID });
//             });
//         }
//       })
//       .then((result) => {
//         // // console.log(result);

//         console.log("Created Product");
//         if (req.body.isLocal == "true")
//           return res.redirect("/admin/user/" + name);
//         return res.redirect("/admin/allUsers");
//       })
//       .catch((er) => {
//         console.log(er);
//       });
//   }
// };

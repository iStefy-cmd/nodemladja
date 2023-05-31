const Transaction = require("../models/transaction");

exports.getUserInfo = (req, res, next) => {
  Transaction.find({ userID: req.user._id })
    .then((trans) => {
      function groupTransactions(transactions) {
        const groupedTransactions = {};

        // Iterate through all transactions
        transactions.forEach((transaction) => {
          const { name } = transaction;
          const debt = transaction.quantity * transaction.price;
          const date = new Date(transaction.createdAt).toDateString();
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

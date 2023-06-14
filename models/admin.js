const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    requests: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        deposit: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        userID: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    name: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Admin", userSchema);

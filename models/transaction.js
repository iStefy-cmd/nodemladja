const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  userID:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
 
},{ timestamps: true });
module.exports = mongoose.model("Transaction", transactionSchema);

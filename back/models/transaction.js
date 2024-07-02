const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionHash: String,
    from: String,
    to: String,
    functionName: String,
    value: String,
    timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    payment_method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    amount: {
        type: Number,
        required: true,
    },
    payment_date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Payment', paymentSchema);
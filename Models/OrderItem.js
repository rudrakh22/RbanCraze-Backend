const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1,
    },
    price_at_order_time:{
        type:Number,
        required:true,
    },
    variant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProductVariant',
    }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
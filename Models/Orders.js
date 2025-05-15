const mongoose = require('mongoose');

const orderSchema=mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    orderStatus:{
        type:String,
        default:'Pending',
        enum:['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    totalPrice:{
        type:Number,
        required:true,
    },
    address_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true,
    },
    deliveryStatus:{
        type:String,
        default:'processing',
        enum:['processing', 'shipped', 'delivered', 'failed']
    },
    trackingNumber:{
        type:String,
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem'
    }],
    estimatedDeliveryDate:{
        type:Date,
    },
    actualDeliveryDate:{
        type:Date,
    },  
},{
    timestamps:true,
})

module.exports=mongoose.model('Order',orderSchema);
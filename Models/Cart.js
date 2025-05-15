const mongoose= require('mongoose');

const cartSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    items:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
            min:1,
            default:1
        },
        variant:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ProductVariants',
            required:true,
        }
    }],
    addedAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('Cart',cartSchema);
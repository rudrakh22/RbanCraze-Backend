const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    rating:{
        type:Number,
        required:[true,'Rating is required'],
        min:1,
        max:5,
    },
    verifiedPurchase:{
        type:Boolean,
        default:false,
    },
    comment:{
        type:String,
        required:[true,'Comment is required'],
    },
    images:[
        {
            type:String,
        },
    ],
    createdAt:{
        type:Date,
        default:Date.now,
    },
},{
    timestamps:true,
})

reviewSchema.index({product_id:1,user_id:1},{unique:true});

module.exports=mongoose.model('Review',reviewSchema);
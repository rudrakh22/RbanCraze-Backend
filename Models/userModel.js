const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true
    },
    additionalDetails:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Profile'
    },
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    addresses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    }],
    resetPasswordExpires:{
        type:Date,
    },
    image:{
        type:String,
    },
    token:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    }
},
    {
        timestamps:true
    })

module.exports=mongoose.model('User',userSchema);
const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please add a product name'],
        trim:true,
    },
    description:{
        type:String,
        required:[true,'please add a description'],
        trim:true,
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    actualPrice: {
        type: Number,
        required: true
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    isSponsored: {
        type: Boolean,
        default: false
    },
    productVariants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProductVariants',
    }],
    category_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    specifications: {
        type:Object,
        required:true
    },
    images:[String],
    dietaryInfo:{
        type:Object,
    },  
    allergens: {
        type: [String]
    },
    expirationDate: { 
        type: Date
    },
    stock_quantity:{
        type:Number,
        required:true,
        min:0,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},
{
    timestamps:true
});

module.exports=mongoose.model('Product',productSchema);
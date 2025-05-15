const mongoose=require('mongoose');

const productVariantSchema=mongoose.Schema({
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true,
    },
    attributes:{
        storageCapacity:{
            type:String,
        },
        material:{
            type:String,
        },
        dimensions:{type:String},
        color:{type:String},
        finishType:{type:String},
        sizeInClothes:{
            type:String,
            required: false,
            default: undefined, 
        },
        sizeInEatables:{
            type:String,
        },
        flavor:{type:String},
        packaging:{
            type:String,
        },
        volume:{
            type:String,
        },
        weight:{
            type:String,
        },
    },
    images:[{
        type:String,
        required:true,
    }],
    stock_quantity:{
        type:Number,
        required:true,
        min:0,
    },
    actualPrice: {
        type: Number,
        required: true
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
},{
    timestamps:true,
})


module.exports=mongoose.model('ProductVariants',productVariantSchema);
const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Category name is required'],
        unique:true,
        trim:true,
    },
    image:[
        {
            type:String,
            required:[true,'Category image is required'],
        }
    ],
    subCategories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
        },
    ],
},{
    timestamps:true,
})

module.exports=mongoose.model('Category',categorySchema);
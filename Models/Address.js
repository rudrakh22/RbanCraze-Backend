const mongoose=require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    address_line_1 : {
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    postal_code:{
        type:String,
        required:true,
    },
    isDefault:{
        type:Boolean,
        default:false,
    },
    });
const Address=mongoose.model('Address',addressSchema);
module.exports=Address;

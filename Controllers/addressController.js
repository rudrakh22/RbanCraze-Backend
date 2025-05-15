const Address=require('../Models/Address');
const mongoose=require('mongoose');
const User=require('../Models/userModel');

exports.createAddress=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {address_line_1,city,state,country,postal_code,isDefault}=req.body;
        if(!address_line_1 || !city || !state || !country || !postal_code){
            return res.status(400).json({message:'Please fill all the fields'});
        }
        if(isDefault){
            await Address.updateMany({user_id:userId,isDefault:true},{$set:{isDefault:false}});
        }
        const address=new Address({
            user_id:userId,
            address_line_1,
            city,
            state,
            country,
            postal_code,
            isDefault: !!isDefault,
        })
        await address.save();
        res.status(201).json({
            success:true,
            message:'Address created successfully',
            data:address
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

exports.getAddresses=async(req,res)=>{
    try{
        const userId=req.user._id;
        const addresses=await Address.find({user_id:userId}).sort({isDefault:-1,_id:-1});
        res.status(200).json({
            success:true,
            message:'Addresses fetched successfully',
            data:addresses
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

exports.getAddressById=async(req,res)=>{
    try{
        const userId=req.user._id;
        const addressId=req.params.id;
        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({message:'Invalid address ID'});
        }
        const address=await Address.findOne({_id:addressId,user_id:userId})
        if(!address){
            return res.status(404).json({message:'Address not found'});
        }
        res.status(200).json({
            success:true,
            message:'Address fetched successfully',
            data:address
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

exports.updateAddress=async(req,res)=>{
    try{
        const userId=req.user._id;
        const addressId=req.params.id;
        const updatedData=req.body;
        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({message:'Invalid address ID'});
        }
        if(updatedData.isDefault){
            await Address.updateMany({user_id:userId,isDefault:true},{$set:{isDefault:false}});
        }
        const updatedAddress=await Address.findOneAndUpdate(
            {_id:addressId,user_id:userId},
            updatedData,
            {new:true,runValidators:true}
        )
        if(!updatedAddress){
            return res.status(404).json({message:'Address not found'});
        }
        res.status(200).json({
            success:true,
            message:'Address updated successfully',
            data:updatedAddress
        });
        
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}

exports.deleteAddress=async(req,res)=>{
    try{
        const userId=req.user._id;
        const addressId=req.params.id;
        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({message:'Invalid address ID'});
        }
        const deleteAddress=await Address.findOneAndDelete({_id:addressId,user_id:userId});
        if(!deleteAddress){
            return res.status(404).json({message:'Address not found'});
        }
        res.status(200).json({
            success:true,
            message:'Address deleted successfully',
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'});
    }
}
const User =require('../Models/userModel');
const crypto=require('crypto');
const {sendEmail}=require('../Utils/mailSender');
const bcrypt=require('bcrypt');
exports.resetPasswordToken=async(req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({error: "Please provide email"});
        }
        const user =await User.findOne({email});
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        const token=crypto.randomBytes(20).toString('hex');
        const updatedDetails=await User.findOneAndUpdate({email},{
            token:token,
            resetPasswordExpires: Date.now()+360000
        },{new:true})
        const url=`http://localhost:5173/update-password/${token}`;
        await sendEmail(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )
        return res.status(200).json({
            success:true,
            message: "Email sent successfully,Please check your Email to Continue further"
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({error: "Server Error"})
    }
}

exports.resetPassword=async(req,res)=>{
    try{
        const {password,confirmPassword,token}=req.body;
        if(confirmPassword !== password){
            return res.status(400).json({error: "Password and confirm Password do not match"});
        }
        const user=await User.findOne({token:token});
        if(!user){
            return res.status(404).json({error: "User not found or Token is invalid"});
        }
        if(!(user.resetPasswordExpires>Date.now())){
            return res.status(404).json({
                success:false,
                message:"Token has expired,Please regenerate your token",
            })
        }
        const encryptedPassword=await bcrypt.hash(password,10);
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true }
            );
        return res.status(200).json({
            success: true,
            message: "Password Reset successfully",
        });
    }catch(err){
        return res.json({
            success:false,
            message:"Error occured while updating password",
            error:err.message
        })
    }
}
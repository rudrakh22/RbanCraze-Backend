const axios=require('axios');
const User=require('../Models/userModel');
const Product=require('../Models/Product')
const jwt=require('jsonwebtoken');
const {oauth2client}=require('../Utils/googleConfig');
const OTP = require('../Models/OTP');
const Profile=require('../Models/Profile');
const sendEmail =require('../Utils/mailSender');
const { passwordUpdated } = require("../mail/template/passwordTemplate");
const bcrypt =require('bcrypt')

exports.googleLogin=async(req,res)=>{

    const code=req.query.code;
    console.log("code",code)
    try{
        const googleRes=await oauth2client.getToken(code);
        console.log("googleRes",googleRes.tokens);
        oauth2client.setCredentials(googleRes.tokens);
        const userRes=await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
        console.log("userRes",userRes.data);
        const {email,name,picture}=userRes.data; 
        let user=await User.findOne({email});
        const [firstName, lastName] = name.split(" ");
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        if(!user){
            user = await User.create({
                firstName,
                lastName,
                email,
                additionalDetails:profileDetails._id,
                image: picture ? picture:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            });
        }
        const {_id}=user;
        const token=jwt.sign({_id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_TIMEOUT
        });
        res.status(200).json({
            message:"Success",
            token,
            user
        })
    }catch(err){
        console.log("Error during authentication",err)
        return res.status(500).json({
            message:"Internal Server Error",
            error:err
        });
    }
}

exports.signup=async(req,res)=>{
    try{
        const {firstName,lastName,email,password,confirmPassword,otp,contactNumber}=req.body;
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(400).json({
                message:"Please fill all the fields",
            });
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match. Please check again.",
            });
        }

        const existingUser=await User.findOne({email});
        console.log("hello",existingUser)
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists. Please use a different one.",
            });
        }
        const response=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        if(!response || !response.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP. Please try again. ----------",
            })
        }
        if(otp.toString() !== response.otp.toString()){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP. Please try again.",
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        const user=await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        res.status(200).json({
            success:true,
            message:"User created successfully",
            user
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        })
    }
};

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email ||!password){
            return res.status(400).json({
                success:false,
                message:"Please fill all the fields",
            });
        }
        const user=await User.findOne({email})
        .populate('additionalDetails')
        .populate('wishlist');
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered with us, Please signup to continue",
            });
        }
        let token="";
        if(await bcrypt.compare(password,user.password)){
            token=jwt.sign({
                _id:user._id
                },process.env.JWT_SECRET,
                {expiresIn:"24h"}
            )
            user.token=token;
            user.password=undefined;
        }
        return res
        .status(200)
        .header("Authorization", `Bearer ${token}`) 
        .json({
            success: true,
            message: "Login successful",
            user,
            token, 
        });
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Login Failed.Please try again later",
            error:error.message
        })
    }
}

exports.sendOTP = async (req, res) => {
        try {
        const { email } = req.body;
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(400).json({
            success: false,
            message: "User is already registered",
            });
        }
    
        let otp = generateOTPAsString(6);
    
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = generateOTPAsString(6);
            result = await OTP.findOne({ otp: otp });
        }
    
        const otpDetails = await OTP.create({
            email,
            otp,
        });
    
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        });
        } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while sending OTP",
        });
    }
};

function generateOTPAsString(length) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1) + min);
    return otp.toString();
}

exports.changePassword=async(req,res)=>{
    try{    
        const userDetails=await User.findById(req.user._id); 
        const {oldPassword,newPassword}=req.body;
        const isPasswordMatch=await bcrypt.compare(oldPassword,userDetails.password)
        if(!isPasswordMatch) {
            return res.status(401).json({
                success:false,
                message:"Incorrect Password",
            });
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);
        const updatedUserDetails=await User.findByIdAndUpdate(req.user._id,{
            password:hashedPassword
        },{new:true})
        try{
            await sendEmail(
                updatedUserDetails.email,
                "Password Changed Successfully",
                passwordUpdated(
                        updatedUserDetails.email,
                        `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            return res.status(200).json({
                success:true,   
                message:"Password changed successfully",
                user:updatedUserDetails
            })
        }catch(err){
            return res.status(500).json({
                success:false,
                message:"Error while sending email",
                error:err.message
            })
        }
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        })
    }
}
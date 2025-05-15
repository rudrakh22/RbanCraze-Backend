const mongoose=require('mongoose');
const {sendEmail}=require('../Utils/mailSender')
const emailTemplate=require('../mail/template/emailVerificationTemplate')

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5 * 60 
    }
})

async function sendEmailVerification(email,otp){
    //Send Email with OTP
    console.log("in sendig email")
    try{
        const emailId=await sendEmail(
            email,
            'Verification Email',
            emailTemplate(otp)
        )
        console.log("sent email",emailId)
    }catch(err){
        console.log("error while sending email verification",err)
    }

}
OTPSchema.pre("save",async function(next){
    if(this.isNew){
        sendEmailVerification(this.email,this.otp);
    }
    next();
})

module.exports=mongoose.model('OTP',OTPSchema); 
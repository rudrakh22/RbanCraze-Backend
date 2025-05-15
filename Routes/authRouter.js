const express=require('express');
const router=express.Router();
const {googleLogin}=require('../Controllers/authController');
const {sendEmail}=require('../Utils/mailSender')
const {signup,login,sendOTP,changePassword}=require('../Controllers/authController');
const {protect}=require('../Middlewares/auth')

const {resetPasswordToken, resetPassword}=require('../Controllers/resetPassword');

router.get('/google',googleLogin);
router.post("/login",login);
router.post("/signup",signup);
router.post("/sendotp",sendOTP);
router.post("/changepassword",protect,changePassword);
router.post('/reset-password-token',resetPasswordToken);
router.post('/reset-password',resetPassword);
router.post('/send-email', sendEmail);

module.exports=router;
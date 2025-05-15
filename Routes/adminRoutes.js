const express=require('express');
const router=express.Router();

const {adminLogin}=require('../Controllers/adminAuth');

router.post('/login',adminLogin);

module.exports=router;
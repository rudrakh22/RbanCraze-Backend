const express= require('express')
const router=express.Router();
const {getProfile,updateProfile,getWishlist,addToWishlist, removeFromWishlist} =require('../Controllers/userController');
const{protect}=require('../Middlewares/auth')

router.use(protect);

router.get('/profile',getProfile)
router.put('/profile',updateProfile);
router.get('/wishlist',getWishlist);
router.post('/wishlist/:productId',addToWishlist)
router.delete('/wishlist/:productId',removeFromWishlist)



module.exports=router;
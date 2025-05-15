const express=require('express');
const router=express.Router();


const {protect}=require('../Middlewares/auth');
const {
    getCart,
    addItemToCart,
    updateCartItem,
    deleteCartItem,
    clearCart
}=require('../Controllers/cartController');

router.use(protect);

router.get('/',getCart);
router.post('/add',addItemToCart);
router.put('/item/:itemId',updateCartItem);
router.delete('/item/:itemId',deleteCartItem);
router.delete('/',clearCart);

module.exports=router;



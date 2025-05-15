const expres=require('express');
const router=expres.Router();

const {createAddress,getAddresses,getAddressById,updateAddress,deleteAddress}=require('../Controllers/addressController');

const {protect}=require('../Middlewares/auth');

router.use(protect);
router.post('/addresses',createAddress);
router.get('/addresses',getAddresses);
router.get('/addresses/:id',getAddressById);
router.put('/addresses/:id',updateAddress);
router.delete('/addresses/:id',deleteAddress);

module.exports=router;
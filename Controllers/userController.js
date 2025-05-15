const User=require('../Models/userModel');
const Product=require('../Models/Product');

exports.getProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).select('-password')
        .populate('additionalDetails')
        .populate('wishlist')
        ;
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({
            success:true,
            data:user
        })
    }catch(e){
        res.status(500).json({message:'Internal Server Error'});
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, gender, dateOfBirth, contactNumber, about } = req.body;
        const user = await User.findById(req.user._id).populate('additionalDetails');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.updatedAt = new Date();
        const profile = user.additionalDetails;

        if (profile) {
            profile.gender = gender || profile.gender;
            profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
            profile.contactNumber = contactNumber || profile.contactNumber;
            profile.about = about || profile.about;
            await profile.save();
        }
        await user.save();
        const updatedUser = await User.findById(req.user._id)
        .select('-password')
        .populate('additionalDetails')
        .populate('wishlist');
        
        res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getWishlist=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).populate('wishlist');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({
            success:true,
            data:user.wishlist
        })
    }catch(e){
        res.status(500).json({message:'Internal Server Error'});
    }
}

exports.addToWishlist=async(req,res)=>{
    try{
        const {productId}=req.params;
        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }
        const user=await User.findByIdAndUpdate(
            req.user._id,
            {$addToSet:{wishlist:productId}},
            {new:true},
        ).populate('wishlist')
        res.status(200).json({
            success:true,
            data:user.wishlist
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.removeFromWishlist=async(req,res)=>{
    try{
        const {productId}=req.params;
        const user=await User.findByIdAndUpdate(req.user._id,
            {$pull:{wishlist:productId}},
            {new:true}
        ).populate('wishlist');

        res.status(200).json({
            success:true,
            data:user.wishlist
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const Cart=require('../Models/Cart');
const Product=require('../Models/Product');
const ProductVariant=require('../Models/ProductVariant');

exports.getCart=async(req,res)=>{
    try{
        let cart=await Cart.findOne({user_id:req.user._id}).populate({
            path:'items.product',})
            .populate('items.variant');
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart is empty",
                data:{items:[]}
            })
        }
        res.status(200).json({
            success:true,
            data:cart
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.addItemToCart=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {product,variant,quantity}=req.body;
        if(!product || !variant){
            return res.status(400).json({
                success:false,
                message:"Product and variant are required"
            })
        }
        const qty=quantity && quantity>0 ?quantity:1;
        let cart=await Cart.findOne({user_id:userId});
        if(!cart){
            cart=new Cart({
                user_id:userId,
                items:[{product,variant,quantity:qty}]
            })
        }else{
            const itemIndex = cart.items.findIndex((item) =>
                    item.product.toString() === product &&
                    item.variant.toString() === variant
                );
            if (itemIndex > -1) {
                    cart.items[itemIndex].quantity += qty;
            } else {
                    cart.items.push({ product, variant, quantity: qty });
                }
            }
            cart.updatedAt = Date.now();
            await cart.save();
            console.log(cart);
            const populatedCart = await cart.populate([
                { path: 'items.product', select: 'name price images' },
                { path: 'items.variant', select: 'attributes price images' }
            ]);
            res.status(200).json({
                success: true,
                message: 'Item added to cart',
                data: populatedCart,
            });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateCartItem=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {itemId}=req.params;
        const {quantity,variant}=req.body;
        if(quantity !== undefined && quantity<1){
            return res.status(400).json({
                success:false,
                message:"Quantity must be atleast 1"
            })
        }
        const cart=await Cart.findOne({user_id:userId});
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        const item=cart.items.id(itemId);
        if(!item){
            return res.status(404).json({
                success:false,
                message:"Item not found"
            })
        }
        if(quantity !==undefined) item.quantity=quantity;
        if(variant) item.variant=variant;
        cart.updatedAt=Date.now();
        await cart.save();

        const populatedCart = await cart.populate([
            { path: 'items.product', select: 'name price images' },
            { path: 'items.variant', select: 'attributes price images' }
        ]);

        return res.status(200).json({
            success:true,
            message:"Item updated",
            data:populatedCart
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteCartItem=async(req,res)=>{
    try{
        const userId = req.user._id;
        const { itemId } = req.params;
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }
        cart.items.pull(itemId);
        cart.updatedAt = Date.now();
        await cart.save();
        const populatedCart = await cart.populate([
            { path: 'items.product', select: 'name price images' },
            { path: 'items.variant', select: 'attributes price images' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: populatedCart,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({
            success: false,
            message: 'Cart not found',
            });
        }
        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();
    
        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const {uploadFiles}=require('../Utils/fileUploader');
const productVariants =require('../Models/ProductVariant')
const Category=require('../Models/Category')
const Product=require('../Models/Product');


exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            brand,
            actualPrice,
            discountPercentage,
            isSponsored,
            category_id,
            specifications,
            dietaryInfo,
            allergens,
            expirationDate,
            stock_quantity
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !description ||
            !brand ||
            !actualPrice ||
            !category_id ||
            !specifications ||
            stock_quantity === undefined
        ) {
            return res.status(400).json({ error: 'Please fill all the required fields' });
        }

        // Parse JSON fields if they are sent as strings
        let parsedSpecifications = specifications;
        let parsedDietaryInfo = dietaryInfo;
        let parsedAllergens = allergens;

        if (typeof specifications === 'string') {
            try {
                parsedSpecifications = JSON.parse(specifications);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid specifications format' });
            }
        }

        if (dietaryInfo && typeof dietaryInfo === 'string') {
            try {
                parsedDietaryInfo = JSON.parse(dietaryInfo);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid dietaryInfo format' });
            }
        }

        // allergens should be an array of strings
        if (allergens && typeof allergens === 'string') {
            try {
                parsedAllergens = JSON.parse(allergens);
                if (!Array.isArray(parsedAllergens)) throw new Error();
            } catch (e) {
                return res.status(400).json({ error: 'Invalid allergens format' });
            }
        }

        // Validate file uploads
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Upload images
        const images = await uploadFiles(req.files);
        if (!images || images.length === 0) {
            return res.status(500).json({ error: 'Cloudinary upload failed' });
        }

        // Create the product
        const product = await Product.create({
            name,
            description,
            brand,
            actualPrice,
            discountPercentage: discountPercentage || 0,
            isSponsored: isSponsored==="true" || false,
            category_id,
            specifications: parsedSpecifications,
            dietaryInfo: parsedDietaryInfo,
            allergens: parsedAllergens,
            stock_quantity,
            images
        });
        if (expirationDate) {
            const parsedDate = new Date(expirationDate);
            if (isNaN(parsedDate)) {
                return res.status(400).json({ error: 'Invalid expirationDate format' });
            }
            product.expirationDate = parsedDate;
        }

        // Fetch and populate the product
        const populatedProduct = await Product.findById(product._id)
            .populate('category_id')
            .populate('productVariants');
        res.status(200).json({
            success:true,
            message: "Product created successfully",
            product: populatedProduct
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.editProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(productId)
        console.log("files",req.files)
        const {
            name,
            description,
            brand,
            actualPrice,
            discountPercentage,
            isSponsored,
            category_id,
            specifications,
            dietaryInfo,
            allergens,
            expirationDate,
            stock_quantity,
            existingImages
        } = req.body;
        let existingImagesUrl;
        if(existingImages){
            existingImagesUrl=JSON.parse(existingImages)
        }
        console.log("existiung",existingImages)
        // Initialize update object
        const updateFields = {};

        // Handle text fields
        if (name) updateFields.name = name;
        if (description) updateFields.description = description;
        if (brand) updateFields.brand = brand;
        if (actualPrice) updateFields.actualPrice = actualPrice;
        if (discountPercentage !== undefined) updateFields.discountPercentage = discountPercentage;
        if (isSponsored !== undefined) updateFields.isSponsored = isSponsored==="true";
        if (category_id) updateFields.category_id = category_id;
        if (expirationDate) updateFields.expirationDate = expirationDate;
        if (stock_quantity !== undefined) updateFields.stock_quantity = stock_quantity;

        // Parse JSON fields with validation
        if (specifications) {
            try {
                updateFields.specifications = typeof specifications === 'string' 
                    ? JSON.parse(specifications)
                    : specifications;
            } catch (e) {
                return res.status(400).json({ error: 'Invalid specifications format' });
            }
        }

        if (dietaryInfo) {
            try {
                updateFields.dietaryInfo = typeof dietaryInfo === 'string'
                    ? JSON.parse(dietaryInfo)
                    : dietaryInfo;
            } catch (e) {
                return res.status(400).json({ error: 'Invalid dietaryInfo format' });
            }
        }

        if (allergens) {
            try {
                const parsed = typeof allergens === 'string'
                    ? JSON.parse(allergens)
                    : allergens;
                    
                if (!Array.isArray(parsed)) {
                    throw new Error('Allergens must be an array');
                }
                updateFields.allergens = parsed;
            } catch (e) {
                return res.status(400).json({ error: 'Invalid allergens format' });
            }
        }
        
        // Handle image uploads
        let images=[]
        if (req.files?.length > 0) {
            images = await uploadFiles(req.files);
            if (!images.length) {
                return res.status(500).json({ error: 'Cloudinary upload failed' });
            }
        }
        updateFields.images = [...existingImagesUrl,...images];
        console.log("updated fields",updateFields.images)
        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateFields,
            { new: true, runValidators: true }
        ).populate('category_id').populate('productVariants');

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.deleteProduct=async(req,res)=>{
    try{
        const {productId}=req.params;
        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            })
        }
        await productVariants.deleteMany({_id:{$in:product.productVariants}})
        await Product.findByIdAndDelete(productId);
        return res.status(200).json({
            success:true,
            message:"Product deleted Successfully"
        })
    }catch(error){
        return res.status(500).json({
            message:error.message,
            success:false
        })
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('category_id') 
            .populate('productVariants'); 
        res.status(200).json({
            success:true,
            message: 'Products fetched successfully',
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

exports.getProductById=async(req,res)=>{
    try{
        const product=await Product.findById(req.params.id)
        .populate('category_id')
        .populate('productVariants')
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Product fetched successfully",
            data:product
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        // 1. Find the category and its subCategories
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 2. Gather all category IDs: the main one and its subcategories
        const categoryIds = [category._id, ...(category.subCategories || [])];

        // 3. Find products in any of these categories
        const products = await Product.find({ category_id: { $in: categoryIds } })
            .populate("category_id")
            .populate("productVariants");

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error while fetching products." });
    }
};


exports.getProductVariants=async(req,res)=>{
    try{
        const {productId}=req.params;
        console.log(productId)
        const variants=await productVariants.find({product_id:productId});
        if(!variants.length){
            return res.status(404).json({
                success:false,
                message:'No variants found for this product'
            })
        }
        res.status(200).json({
            success:true,
            data:variants
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.createProductVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log("productId",productId)
        const { stock_quantity, actualPrice, discountPercentage, attributes } = req.body;
        console.log("body",req.body)
        console.log("files",req.files)

        // Validate required fields
        if (
            stock_quantity === undefined ||
            actualPrice === undefined ||
            !attributes
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields"
            });
        }

        // Parse attributes
        let parsedAttributes;
        try {
            parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: "Invalid attributes format"
            });
        }

        // Validate file uploads
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Upload images
        const images = await uploadFiles(req.files);
        if (!images || images.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Cloudinary upload failed"
            });
        }

        // Create variant
        const variant = await productVariants.create({
            product_id: productId,
            stock_quantity,
            actualPrice,
            discountPercentage: discountPercentage || 0,
            attributes: parsedAttributes,
            images
        });

        // Add variant to product
        product.productVariants.push(variant._id);
        await product.save();

        res.status(200).json({
            success: true,
            message: "Product variant created successfully",
            data: variant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.deleteProductVariant=async(req,res)=>{
    try{
        const {variantId}=req.params;
        console.log(variantId)
        const variant=await productVariants.findById(variantId);
        console.log(variant)
        if(!variant){
            return res.status(404).json({
                success:false,
                message:"Variant not found"
            })
        }
        await Product.findByIdAndUpdate(variant.product_id,{
            $pull:{ productVariants:variantId}
        },{new:true});
        await productVariants.findByIdAndDelete(variantId);
        res.status(200).json({
            success:true,
            message:"Variant deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateProductVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { attributes, actualPrice, discountPercentage, stock_quantity,existingImages } = req.body;
        let existingImagesUrl;
        if(existingImages){
            existingImagesUrl=JSON.parse(existingImages)
        }

        const updateData = {};

        // Parse attributes if provided (handle JSON string or object)
        if (attributes) {
            try {
                updateData.attributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format for attributes',
                });
            }
        }

        // Validate and set actualPrice
        if (actualPrice !== undefined) {
            const priceNum = Number(actualPrice);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Actual price must be a non-negative number',
                });
            }
            updateData.actualPrice = priceNum;
        }

        // Validate and set discountPercentage
        if (discountPercentage !== undefined) {
            const discountNum = Number(discountPercentage);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount percentage must be a number between 0 and 100',
                });
            }
            updateData.discountPercentage = discountNum;
        }

        // Validate and set stock_quantity
        if (stock_quantity !== undefined) {
            const stockNum = Number(stock_quantity);
            if (isNaN(stockNum) || stockNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock quantity must be a non-negative number',
                });
            }
            updateData.stock_quantity = stockNum;
        }

        // Handle images if files uploaded (assuming multer middleware)
        let images=[]
        if (req.files?.length > 0) {
            images = await uploadFiles(req.files);
            if (!images.length) {
                return res.status(500).json({ error: 'Cloudinary upload failed' });
            }
        }
        updateData.images = [...existingImagesUrl,...images];
        console.log("updated fields",updateData.images)

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided to update',
            });
        }

        const updatedVariant = await productVariants.findByIdAndUpdate(
            variantId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedVariant) {
            return res.status(404).json({
                success: false,
                message: 'Product variant not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product variant updated successfully',
            data: updatedVariant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getVariantById = async (req, res) => {
    try {
        const { variantId } = req.params;

        const variant = await productVariants.findById(variantId).populate('product_id');

        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        res.status(200).json(variant);
    } catch (error) {
        console.error('Error fetching variant by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.latestProducts=async(req,res)=>{
    try{
        const products=await Product.find({}).sort({createdAt:-1}).limit(10).populate('category_id').populate('productVariants');
        console.log(products)
        res.status(200).json({
            success:true,
            message:"Latest products fetched successfully",
            data:products
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


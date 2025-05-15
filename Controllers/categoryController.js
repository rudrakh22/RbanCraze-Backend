const Category = require("../Models/Category");
const mongoose = require("mongoose");
const { uploadFiles } = require("../Utils/fileUploader");

exports.createCategory=async(req,res)=>{
    try{
        const {name,subCategories}=req.body;
        let parsedsubCategories=[];
        if(subCategories && typeof subCategories === 'string'){
            parsedsubCategories=JSON.parse(subCategories);
        }
        if(!name){
            return res.status(400).json({
                success:false,
                message:'Category name is required',
            })
        }
        if(!req.files && req.files.length===0){
            return res.status(400).json({
                success:false,
                message:'Category image is required',
            })
        }
        
        // check if category already exists
        const existingCategory=await Category.findOne({name});
        if(existingCategory){
            return res.status(400).json({
                success:false,
                message:'Category already exists',
            })
        }
        if(parsedsubCategories && parsedsubCategories.length>0){
            for (const subCategoryId of parsedsubCategories) {
                const subCategory = await Category.findById(subCategoryId);
                if (!subCategory) {
                    return res.status(400).json({
                        success: false,
                        message: `Subcategory with ID ${subCategoryId} does not exist`,
                    });
                }
            }
        }
        console.log("Files in api",req.files)
        const images = await uploadFiles(req.files);
        console.log("HEllo",images)
        if (images.length === 0) {
            return res.status(500).json({ error: 'Cloudinary upload failed' });
        }
        const category=new Category({
            name,
            subCategories:parsedsubCategories || [],
            image:images,
        })
        const savedCategory=await category.save();
        res.status(200).json({
            success:true,
            message:'Category created successfully',
            data:savedCategory,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

exports.editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params; // Category ID from params
        const { name } = req.body; // New name for the category

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }


        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // Check if the new name already exists in another category
        const existingCategory = await Category.findOne({ name });
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            return res.status(400).json({
                success: false,
                message: 'A category with this name already exists',
            });
        }

        // Update the category's name
        let images=[];
        console.log("files",req.files)
        if(req.files && req.files.length>0){
            images=await uploadFiles(req.files);
        }
        category.name = name;
        category.image=images;
        const updatedCategory = await category.save(); // Automatically updates updatedAt

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        // Fetch all categories and populate their subcategories
        const categories = await Category.find({})
            .populate({
                path: 'subCategories', // Populate subCategories field
                select: '_id name', // Select specific fields for subcategories
            });

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params; // Category ID from params

        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // Remove references to this category from parent categories (if applicable)
        await Category.updateMany(
            { subCategories: categoryId },
            { $pull: { subCategories: categoryId } }
        );

        // Delete the category itself
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.createAndAddSubCategory = async (req, res) => {  
    try {
        const { parentId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required',
            });
        }
        if(!req.files && req.files.length===0){
            return res.status(400).json({
                success:false,
                message:'Subcategory image is required',
            })
        }


        // Validate parent category
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'Parent category not found',
            });
        }

        // Check for existing subcategory name
        const existingSubCategory = await Category.findOne({ name });
        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name already exists',
            });
        }

        // Create subcategory
        const images = await uploadFiles(req.files);
        console.log("image",images)
        if (images.length === 0) {
            return res.status(500).json({ error: 'Cloudinary upload failed' });
        }
        const subCategory = await Category.create({
            name,
            image: images,
            subCategories: [],
        });

        // Update parent category
        parentCategory.subCategories.push(subCategory._id);
        await parentCategory.save();

        // Get updated parent with populated subcategories
        const updatedParent = await Category.findById(parentId)
            .populate('subCategories');

        res.status(201).json({
            success: true,
            message: 'Subcategory created and added successfully',
            data: {
                parent: updatedParent,
                subCategory: subCategory
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteSubCategory=async(req,res)=>{
    try{
        const {parentId}=req.params;
        const {subCategoryId}=req.body;

        const parentCategory=await Category.findById(parentId);
        if(!parentCategory){
            return res.status(404).json({
                success:false,
                message:"Parent category not found"
            })
        }
        const subCategory=await Category.findById(subCategoryId);
        if(!subCategory){
            return res.status(404).json({
                success:false,
                message:"Subcategory not found",
            })
        }
        await Category.findByIdAndUpdate(parentId,{
            $pull:{subCategories:subCategoryId}
        });
        await Category.findByIdAndDelete(subCategoryId)
        res.status(200).json({
            success:true,
            message:"SubCategory deleted and removed from parent successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.editSubCategoryName = async (req, res) => {
    try {
        const { parentId } = req.params; // Parent category ID from params
        const { subCategoryId, newName } = req.body; // Subcategory ID and new name from body

        // Validate input
        if (!newName) {
            return res.status(400).json({
                success: false,
                message: 'New subcategory name is required',
            });
        }

        // Validate parent category
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'Parent category not found',
            });
        }

        // Validate subcategory
        const subCategory = await Category.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found',
            });
        }

        // Check if the new name already exists in another subcategory
        const existingSubCategory = await Category.findOne({ name: newName });
        if (existingSubCategory && existingSubCategory._id.toString() !== subCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'A category with this name already exists',
            });
        }

        // Update the subcategory's name
        const images=[];
        if(req.files && req.files.length>0){
            images=await uploadFiles(req.files);
        }
        subCategory.name = newName;
        subCategory.image=images;
        const updatedSubCategory = await subCategory.save();

        res.status(200).json({
            success: true,
            message: 'Subcategory name updated successfully',
            data: updatedSubCategory,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCategoriesWithSubCategories = async (req, res) => {
    try {
        // Fetch categories where subCategories field is not empty
        const categories = await Category.find({ subCategories: { $ne: [] } })
            .populate({
                path: 'subCategories', // Populate subCategories field
                select: '_id name', // Select specific fields for subcategories
            });

        res.status(200).json({
            success: true,
            message: 'Categories with subcategories fetched successfully',
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
        return res.status(400).json({ success: false, message: "Category ID is required" });
        }
        const category = await Category.findById(categoryId).populate("subCategories");
        if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, category });
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
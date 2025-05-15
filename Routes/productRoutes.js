const express=require('express');
const router=express.Router();
const {
    createProduct,
    editProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getProductVariants,
    createProductVariant,
    deleteProductVariant,
    updateProductVariant,
    latestProducts,
    getProductsByCategory,
    getVariantById
}=require('../Controllers/productController');
const {
    createCategory,
    createAndAddSubCategory,
    deleteSubCategory,
    editSubCategoryName,
    getCategoriesWithSubCategories,
    getAllCategories,
    editCategory,
    deleteCategory,
    getCategoryById
}=require('../Controllers/categoryController');
const {admin}=require('../Middlewares/admin');


// admin routes

// product routes
router.post('/createProduct',admin,createProduct);
router.put('/editProduct/:productId',admin,editProduct)
router.delete('/deleteProduct/:productId',admin,deleteProduct)
router.get('/getallproducts',getAllProducts)
router.get('/details/:id',getProductById)

// additional product routes
router.get('/latest',latestProducts)
// router.get('/bestsellers',bestSellers)

// product variants
router.get('/details/:productId/variants',getProductVariants)
router.post('/createVariant/:productId/',admin,createProductVariant)
router.delete('/deleteVariant/:variantId',admin,deleteProductVariant)
router.put('/editVariant/:variantId',admin,updateProductVariant)
router.get('/variant-details/:variantId',admin,getVariantById)


//category routes
router.post('/createCategory',admin,createCategory)
router.put('/editcategory/:categoryId',admin,editCategory);
router.get('/allCategories',admin,getAllCategories);
router.delete('/deletecategory/:categoryId',admin,deleteCategory);
router.get("/categories/:categoryId",getProductsByCategory);
router.get("/get-category/:categoryId", getCategoryById);

//subcategoryRoutes
router.post('/createAndAddSubCategory/:parentId',admin,createAndAddSubCategory)
router.delete('/deleteSubCategory/:parentId',admin,deleteSubCategory)
router.put('/editSubCategoryName/:parentId',admin,editSubCategoryName)
router.get('/getCategoriesWithSubCategories',getCategoriesWithSubCategories)


module.exports=router;
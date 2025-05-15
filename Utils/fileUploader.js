const fs=require('fs');
const {uploadOnCloudinary}=require('./cloudinary');

exports.uploadFiles=async(files)=>{
    try{
        if(!files || files.length===0){
            return [];
        }
        const uploadPromises=files.map(async(file)=>{
            const response = await uploadOnCloudinary(file.path);
            if(response) return response.secure_url;
            return null;
        })
        const uploadedUrls=await Promise.all(uploadPromises);
        return uploadedUrls.filter(url=>url!==null);
    }catch(err){
        console.log(err);
        return [];
    }
}
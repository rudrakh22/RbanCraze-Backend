const jwt=require('jsonwebtoken');


exports.protect=async(req,res,next)=>{
    try{
        const token=req.body.token || req.header('Authorization').replace("Bearer ","");
        if(!token){
            return res.status(401).json({msg:"Not authorized, token is required"});
        }
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            req.user=decoded;
        }catch(e){
            return res.status(401).json({
                success:false,
                nessage:"Invalid token"
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Something went wrong while verifying token"
        })
    }
}
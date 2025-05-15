const jwt=require('jsonwebtoken');

exports.adminLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'Please provide email and password'});
        }
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token=jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'1d'});
            res.status(200).json({
                success:true,
                message:'Login successful',
                token
            })
        }else{
            res.status(401).json({
                success:false,
                message:'Invalid credentials'
            });
        }
        
    }catch(error){
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
}
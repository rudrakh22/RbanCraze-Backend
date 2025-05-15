const express=require('express');
const cors=require('cors');
const app=express();
require('dotenv').config()
require('./Utils/dbConnection')
const authRouter=require('./Routes/authRouter')
const userRoutes=require('./Routes/userRoutes')
const productRoutes=require('./Routes/productRoutes')
const adminRoutes=require('./Routes/adminRoutes')
const cartRoutes=require('./Routes/cartRoutes')
const addressRoutes=require('./Routes/addressRoutes')
const orderRoutes = require('./Routes/orderRoutes');
const PORT=process.env.PORT || 4000;
const {upload}=require('./Middlewares/multer')
const {uploadFiles}=require('./Utils/fileUploader')
const allowedOrigins = [
  'https://rban-craze-admin.vercel.app',
  'https://rban-craze-admin-9ler6qmxg-rudrakh22s-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use(upload.array('images',10));

// app.post('/profile',async(req,res)=>{
//     if(!req.files || req.files.length===0){
//         return res.status(400).json({error:'No files uploaded'});
//     }
//     const urls=await uploadFiles(req.files);
//     if(urls.length===0){
//         return res.status(500).json({error:'Cloudinary upload failed'});
//     }
//     res.status(200).json({
//         message:"Files uploaded successfully",
//         images:urls,
//     })
// })

app.use('/auth',authRouter)
app.use('/api/users',userRoutes);
app.use('/api/products',productRoutes)
app.use('/api/admin/',adminRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/',addressRoutes)
// app.use('/api', orderRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port 5000');
  });



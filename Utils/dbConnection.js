const mongoose=require('mongoose');
const MONGO_URL=process.env.MONGO_URL

mongoose.connect(MONGO_URL).then(()=>{
    console.log('Connected to MongoDB');
    }).catch((err)=>{
        console.error('Error connecting to MongoDB',err);
    })
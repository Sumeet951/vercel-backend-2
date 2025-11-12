import mongoose from "mongoose";
const MONGO_URL=process.env.MONGO_URL || "mongodb://127.0.0.1:27017/SEM5"

const databaseconnect=async ()=>{
    try{
        const {connection}=await mongoose.connect(MONGO_URL);
    if(connection){
        console.log(`Connected to MongoDB ${connection.host}`)
    }
    }
    catch(e){
        console.log(e);
        process.exit(1);
    }
}
export default databaseconnect;
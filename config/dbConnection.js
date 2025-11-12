import mongoose from "mongoose";
const MONGO_URL="mongodb+srv://sg297979_db_user:cyWxu2oiXQQAVhYQ@cluster0.idh4dmt.mongodb.net/"

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
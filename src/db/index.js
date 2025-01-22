import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try{
         const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
            console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`); // do it. it will give you info about it  
            
    } catch(error){
        console.log("MONGODB connection error");
        process.exit(1) // read more about exit code like 1 and other
    }
}

export default connectDB
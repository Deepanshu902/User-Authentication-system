import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        role:{
            type:String,
            
        },

        isActive:{
            type:Boolean,
            default:false
        },
        password:{
            type:String,
            required:true
        },
        refreshToken : {
            type: String
        }


    },
    {timestamps:true})



    userSchema.pre("save",async function (next) { 
        if(!this.isModified("password")){ // if password not modified than we return
            return next()
        }
        this.password =  await bcrypt.hash(this.password,10)
        next()
    })

    userSchema.methods.isPasswordCorrect = async function (password){
        return await  bcrypt.compare(password, this.password) // this.password is encrypted one
      }
      


      userSchema.methods.generateAccessToken = function(){
        return jwt.sign(
             {
                 _id: this._id,
                 email:this.email,
                 
             },
             process.env.ACCESS_TOKEN_SECRET,
             {
                 expiresIn: process.env.ACCESS_TOKEN_EXPIRY
             }
         )
     
         
     }
     
     userSchema.methods.generateRefreshToken = function(){
         return jwt.sign(
             {
                 _id: this._id,
             },
             process.env.REFRESH_TOKEN_SECRET,
             {
                 expiresIn: process.env.REFRESH_TOKEN_EXPIRY
             }
         )
     }
       

    export const User = mongoose.model("User",userSchema)
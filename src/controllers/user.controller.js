import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/AysncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"


// learn about cokkies and refresh token and access token for easy user logout func

const options = {
    httpOnly:true,  // anyone can modifiy cookie from frontend but after after this frontend can only see
    secure:true
 }

  const  generateAccessAndRefreshTokens = async(userId)=>{
    try{
       const user = await User.findById(userId)
     const accessToken =  user.generateAccessToken()
      const refreshToken=  user.generateRefreshToken()
  
       user.refreshToken = refreshToken // save value to db 
       await  user.save({ validateBeforeSave : false })  // save the updated user
       // dont do any validation just save the user
  
       return {refreshToken,accessToken}
  
    }
    catch(error){
       throw new ApiError(501,"Something went wrong while generating refresh and access token ")
    }
  }


const registerUser = asyncHandler(async(req,res)=>{
    const{email,name,password} = req.body

    if(!email || !name || !password){
        throw new ApiError(401,"All fields required")
    }

    const existedUser = await User.findOne({
        $or:[{email}] // work like or 
     })
  
     if(existedUser){
        throw new ApiError(409,"Already Exist")
     }

    const user = await User.create({
        name:name.toLowerCase(),
        email,
        password,
       
        isActive : true
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"   
      )  
    

    if(!createdUser){
        throw new ApiError(500,"Something went wrong ")
    }
  
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered") 
     )
  
})

const loginUser = asyncHandler(async(req,res)=>{

    const {email,password} = req.body

    if(!email || !password){
        throw new ApiError(401,"Email and Password Required")
    }
    const user = await User.findOne({ email })

    if(!user){
        throw new ApiError(404,"User dont exist")
     }

   const correctPassword =  await user.isPasswordCorrect(password)

   if (!correctPassword) {
    throw new ApiError(401, "Invalid email or password");
  }
   

    const {refreshToken,accessToken} =  await generateAccessAndRefreshTokens(user._id)  

    

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )
  
     return res.status(200).
     cookie("accessToken",accessToken,options).
     cookie("refreshToken",refreshToken,options).
     json( new ApiResponse(200,loggedInUser,"Login Success"))


})
const currentUser = asyncHandler(async(req,res)=>{

    return res.status(200).json(new ApiResponse(200,req.user,"CurrentUser Fetch successfully"))

})
const assignRole = asyncHandler(async(req,res)=>{
       const{emailId} = req.body
    
 if(emailId != "deepanshubad000"){
    const user = await User.findByIdAndUpdate( req.user._id,{
        role : "user"
    }).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Success"))

 }
 return res.status(200).json(new ApiResponse(200,{role : "user"},"Your are User"))

 
        
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
           $set:{
              refreshToken: undefined,
              isActive: false
           }
           },
           {
              new: true
           })
    
    return res.status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User Logged out"))
        
        
          
        
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}= req.body
 
   const user = await User.findById(req.user?._id)
     const isPasswordCorrect = await  user.isPasswordCorrect(oldPassword)
 
     if(!isPasswordCorrect){
        throw new  ApiError(400,"Old password not correct")
     }
     user.password = newPassword
     await user.save({validateBeforeSave:false})
 
     return res.status(200).json(new ApiResponse(200,{},"Password Changed Successfully"))
     })

export{
    registerUser,loginUser,currentUser,assignRole,logoutUser,changeCurrentPassword
}


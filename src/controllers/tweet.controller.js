import mongoose, {isValidObjectId} from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler( async (req ,res) =>{
      const { content } = req.body;

     if(!content?.trim()){
        throw new ApiError(400 , "Content is required");
     }

    const tweet = await Tweet.create({
         content,
         owner: req.user._id
    })

    return res.status(201).json( new ApiResponse(201, tweet , "Tweet successfully created"));

})

const getUserTweets = asyncHandler( async (req,res) =>{
     const {  userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400 , "Invalid userId")
    }
    
    const tweets = await Tweet.find({ owner: userId }).populate("owner", "username fullName avatar") 

    const total = await Tweet.countDocuments({ owner:userId })

    return res.status(200).json(new ApiResponse(200, tweets,total,"user tweets fetched successfully"))

} )

const updateTweet = asyncHandler(async (req,res) => {
        const { tweetId } = req.params;
        const { content } = req.body;

         if(!isValidObjectId(tweetId)){
                throw new ApiError(400 , "Invalid tweetId")
          }
          
          const tweet = await Tweet.findOneAndUpdate( { _id: tweetId , owner:req.user._id } , { 
             $set: {
                content
             }
           } , { new: true} )
           
           return res.status(200).json( new ApiResponse(200, tweet , "Tweet update successfully"))

})

const deleteTweet = asyncHandler( async (req,res) =>{
    const {  tweetId }  = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "Invalid tweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) throw new ApiError(404 , "Tweet not found")

    if(!tweet.owner.equals(req.user._id)){
         throw new ApiError(403,  "you are not authorized to delete this tweet")
    }

    await tweet.deleteOne();

     return res.status(200).json(200 , {} , "Tweet delete successfully")

} )

export { createTweet , getUserTweets , updateTweet , deleteTweet}
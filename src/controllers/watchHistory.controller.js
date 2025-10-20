import mongoose, { isValidObjectId } from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const addToWatchHistory = asyncHandler(async(req , res) =>{
       const { videoId } = req.params;

        if(!isValidObjectId(videoId)){
            throw new ApiError(400 , "invalid video id") 
        }  

       const video = await Video.findById(videoId)
       if(!video) throw new ApiError(404 , "Video not found") 

      const updatedUser = await User.findByIdAndUpdate(

        req.user._id, {

            $pull: { watchHistory: videoId },
            $push: { watchHistory: { $each: [videoId] , $position: 0, $slice:50 } }
            
        }, { new: true } 

      ).select("watchHistory")

       return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Video added to watch history"));

})

const getWatchHistory = asyncHandler(async (req,res) =>{

    const user = await findById(req.user._id).populate(
        {
            path: "watchHistory",
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        }
    )

    return res
    .status(200)    
    .json(new ApiResponse(200, user.watchHistory, "Watch history fetched successfully"));

       
})

const clearWatchHistory = asyncHandler( async(req,res) =>{
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { watchHistory:[] } },  
            { new : true}
        )

        return res.status(200).json(200 , user.watchHistory , "Watch History clear successfully") 


})

export { addToWatchHistory, getWatchHistory,clearWatchHistory }


import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"

const getChannelStats = asyncHandler( async(req , res) => {
    const channelId = req.user._id
        
     if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
     }

     const totalVideos = await Video.countDocuments({ owner: channelId })

     const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

     const totalLikes = await Like.countDocuments({ video: { $exists: true } })

     const videos = await Video.find({ owner: channelId } , "views")

     const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);

     return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalSubscribers,
                totalLikes,
                totalViews,
            },
            "Channel stats fetched successfully"
        )
    );


} )

const getChannelVideos = asyncHandler( async(req , res) => {
    
     const channelId = req.user._id;

     if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
     }

    const videos = await Video.find({ owner: channelId}).sort({ createdAt: -1 }).populate("owner", "username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));    

} )

export { getChannelStats , getChannelVideos }
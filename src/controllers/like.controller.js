import mongoose , { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from '../models/tweet.model.js'


const toogleVideoLike = asyncHandler( async(req,res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
         throw new ApiError(400 , "Invalid video id" )
    } 

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({ video: videoId , likedBy: req.user._id }); 

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json( new ApiResponse(200, {}, "Video unlike successfully"));
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id,
    })

    return res.status(200).json( new ApiResponse(200, {} , "Video like successfully"));


})

const toogleCommentLike = asyncHandler( async(req,res) => {
       const { commentId } = req.params;

       if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Invalid comment id");
       }

       const comment = await Comment.findById(commentId);

       if(!comment){
         throw new ApiError(404, "Comment not found");
       }

       const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
       })

     
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json( new ApiResponse(200,{}, "comment unlike successfully"));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    })

    return res.status(200).json( new ApiResponse(200,{}, "comment like successfully"));

})

const toogleTweetLike = asyncHandler( async(req,res) => {
     const { tweetId } = req.params;

      if(!isValidObjectId(tweetId)){
       throw new ApiError(400, "Invalid tweet id");
      }

      const tweet = await Tweet.findById(tweetId);

    if(!tweet){
          throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    })

     if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet liked successfully"));

} )

const getLikedVideos = asyncHandler( async(req,res) => {
        const likes = await Like.find({ likedBy: req.user._id , video:{ $exists: true } })
                                .populate({
                                    path: "video",
                                    populate:{
                                         path: "owner",
                                         select: "username fullName avatar",
                                    }
                                })
                                .sort({ createdAt: -1 });

        const likedVideos = likes.map((like) => like.video).filter(Boolean);

           return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));


})

export {  toogleVideoLike  , toogleCommentLike , toogleTweetLike  , getLikedVideos}
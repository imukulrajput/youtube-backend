import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler( async(req , res) => {
          
            const { videoId } = req.params
            const { page = 1, limit = 10 } = req.query   
            
            if(!isValidObjectId(videoId)){
                 throw new ApiError(400 , "Invalid video ID")     
            }
    
            const videoExists = await Video.findById(videoId);
            if(!videoExists) throw new ApiError(400 , "video not found");
 
            const skip = ( Number(page) - 1 ) * Number(limit);

            const comments = await Comment.find({ video: videoId }).populate("owner" , "username avatar")
                                                        .sort({createdAt: -1}) 
                                                        .skip(skip)
                                                        .limit(Number(limit));       

            const totalComments = await Comment.countDocuments(videoId);

            return res.status(200).json( new ApiResponse(200 , {
                 comments,
                 currentPage: Number(page),
                 totalpages: Math.ceil(totalComments/Number(limit)),
                 totalComments,
            } , "comments feteched successfully"))


})

const addComment = asyncHandler( async(req,res) => {
     const { videoId } = req.params;
     const { content } = req.body;

     if( !content || !content.trim() ){
            throw new ApiError(400 , "comment content is required");
     }

     if(!isValidObjectId(videoId)){
         throw new ApiError(400 , "Invalid video Id");
     }

     const video = await Video.findById(videoId);
     if(!video){
         throw new ApiError(404 , "video not found");
     }

     const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
     })
     return res.status(201).json( new ApiResponse(201, comment , "Successfully comment created") );
})

const updateComment = asyncHandler( async(req,res) => {
    const { commentId } = req.params;
    const { content } = req.body;

     if(!isValidObjectId(commentId)){
         throw new ApiError(400 , "Invalid comment Id");
     }
 
         if( !content || !content.trim() ){
            throw new ApiError(400 , "content is cannot be empty");
     }

     const comment = await Comment.findById(commentId);

     if(!comment){
        throw new ApiError (404, "Comment not found");
     }

     if( comment.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "you are not authroized to update this comment");
     }

     comment.content = content;
     await comment.save();

     return res.status(200).json( new ApiResponse(200 , "comment updated successfully"));

})  

const deleteComment = asyncHandler( async(req,res) => {

    const { commentId } = req.params;

     if(!isValidObjectId(commentId)){
         throw new ApiError(400 , "Invalid comment Id");
     }   


    const comment = await Comment.findById(commentId);

     if(!comment){   
        throw new ApiError (404, "Comment not found");
     }

      if( comment.owner.toString() !== req.user._id.toString()){
         throw new ApiError(403, "you are not authroized to delete this comment");
     }

     
    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted successfully")
    );




 


})

export { getVideoComments , addComment , updateComment , deleteComment  }  
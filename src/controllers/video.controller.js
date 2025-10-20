import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"  


const getAllVideos = asyncHandler( async(req , res ) => {
        const { page = 1 , limit =  10 , query, sortBy= "createdAt", sortType="desc", userId } = req.query
             
            const filter = {};
            if(query){
                filter.title = { $regex: query , $options: "i" };
            }

            if(userId){
                if(!mongoose.Types.ObjectId.isValid(userId)){
                    throw new ApiError(400, "Invalid userId");
                }
                filter.owner = userId;
            }
              
            const sortOptions = {};
            sortOptions[sortBy] = sortType === "asc" ? 1 : -1 ;
             
            const skip = ( parseInt(page) -1)* parseInt(limit); 

            const videos = await Video.find(filter)
                    .populate("owner" , "username fullName avatar")
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(parseInt(limit));
            
            const total = await Video.countDocuments(filter); 

            return res.status(200).json( new ApiResponse(200, { videos, page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total/parseInt(limit))} , "videos fetched successfully") )

    
} )

const publishAVideo = asyncHandler(async (req, res) => {
      
    const { title , description } = req.body

    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400, "Title and description is required"); 
    }  
    
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;     

    if(!videoFilePath || !thumbnailFilePath){
        throw new ApiError(400 , "video file and thumbnail are required");
    }

    const videoUpload = await uploadOnCloudinary(videoFilePath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailFilePath);     


    if(!videoUpload || !thumbnailUpload){
        throw new ApiError(400, "falied to upload files to cloudinary")
    }

    const video = await Video.create({
        title, 
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        isPublished: true,
        owner: req.user._id,
        duration: videoUpload.duration || 0,

    })

        return res.status(201).json(
                new ApiResponse(201, video, "Video published successfully")
            );


})

const getVideoById = asyncHandler(async (req,res) =>{
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400 , "Invalid videoId")
    }

    const video = await Video.findById(videoId).populate("owner" , "username fullName avatar")
    if(!video) throw new ApiError(404, 'Video not found');

    return res.status(200)
            .json(new ApiResponse(200, video, "video fetched successfully"));
})

const updateVideo = asyncHandler( async(req,res) => {
     const { videoId } = req.params;
  
     if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400 , "Invalid videoId");
     }

    const video = await Video.findById(videoId);

    if(!videoId) throw new ApiError(400, "Video not found");
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const { title , description } = req.body;

    if(title) video.title = title;
    if(description) video.description = description;

    if(req.file?.path){
         const thumbnailUpload = await uploadOnCloudinary(req.file.path);
         video.thumbnail = thumbnailUpload.url;
    }

    await video.save();   
 
     return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));

     
})     


const deleteVideo = asyncHandler( async(req,res) => {
     const { videoId } = req.params;


     if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400 , "Invalid videoId");
     }
     
     const video = await Video.findById(videoId);
     if(!video) throw new ApiError(404 , "Video not found"); 

     if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, " You are not authroized to delete this video");
     }

    await video.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));   
    


}) 


const tooglePublishStatus = asyncHandler ( async (req,res) => {
      const { videoId } = req.params;

      if(!mongoose.Types.ObjectId.isValid(videoId)){
         throw new ApiError(400, "Invalid videoId");
      }

       const video = await Video.findById(videoId);
       if(!video) throw new ApiError(404 , "Video not found")
       if (!video.owner.equals(req.user._id)) {
           throw new ApiError(403, "You are not authorized to change publish status");
        }
       
      video.isPublished = !video.isPublished;
      await video.save();

       return res.status(200).json(
           new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`)
      );

})



export { getAllVideos , publishAVideo , getVideoById , updateVideo , deleteVideo , tooglePublishStatus}
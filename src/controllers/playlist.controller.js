import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler( async(req,res) => {
    
    const { name , description } = req.body;

    if(!name?.trim() || !description?.trim()){
         throw new ApiError(400 , "Name and Description is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json( new ApiResponse( 201 , playlist , "Playlist created successfully" ));

}) 


const getUserPlaylists = asyncHandler( async(req,res) => {
       const { userId } = req.params;

       if(!isValidObjectId(userId)){
            throw new ApiError(400 , "Invalid User Id")
       }
                          
     const playlists = await Playlist.find({owner:userId}).populate("videos" , "title thumbnail duration views").sort({ createdAt: -1 });

    return res.status(200).json( new ApiResponse(200 , playlists , "user playlist fetched successfully"))
   


})  

const getPlaylistById = asyncHandler( async(req,res) => {
     const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400 , "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId)
                                    .populate("videos" , "title thumbnail duration views" )
                                    .populate("owner", "username fullName avatar" )


     if(!playlist){
         throw new ApiError(404 , "playlist not found");
     }                                

     return res.status(200).json( new ApiResponse(200 ,playlist , "playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler( async(req,res) =>{
     const { playlistId , videoId }  = req.params;

     if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400 , "playlist Id or video Id is invalid")
     }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(4040, "playlist not found")

    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "you are not authorized to modify this playlist")
    }    

    if(playlist.videos.includes(videoId)){
         throw new ApiError(400 , "video already exists")
    }

//    playlist.videos.push(videoId);
//    await playlist.save();

    await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
    );

    return res.status(200).json( new ApiResponse(200 , playlist , "video added to playlist successfully"));

})

const removeVideoFromPlaylist = asyncHandler( async(req, res) =>{
     const { playlistId , videoId } = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400 , "playlist Id or video Id is invalid")
     }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId , owner: req.user._id },
        {  $pull: { videos: videoId } },
        { new: true } 
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or you are not authorized");  
    }
    res.status(200).json( new ApiResponse(200 , updatedPlaylist , "video is removed from playlist")) 
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
     if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400 , "playlist Id is invalid")
     }  

     const playlist = await Playlist.findById(playlistId);
     if(!playlist) throw new ApiError(404, "playlist not found");

     if(!playlist.owner.equals(req.user._id)){
         throw new ApiError(403, "you are not authorized to delete this playlist")
     }
    await playlist.deleteOne();

     return res.status(200).json( new ApiResponse(200 , {} , "playlist delete successfully"));
})

const updatePlaylist = asyncHandler(async (req,res) => {
     const { playlistId } = req.params
     const {  name , description } = req.body

     if(!isValidObjectId(playlistId) ){
        throw new ApiError(400 , "playlist Id is invalid")
     }    

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id }, {
        $set: {
            name ,
            description
        }
    } , {  new : true } )

     if (!playlist) {
        throw new ApiError(404, "Playlist not found or you are not authorized");
    }
          

    return res.status(200).json(new ApiResponse(200 , playlist , "Playlist details updated successfully"))
        


} )



export { createPlaylist, getUserPlaylists , getPlaylistById, addVideoToPlaylist  , removeVideoFromPlaylist , deletePlaylist  , updatePlaylist}
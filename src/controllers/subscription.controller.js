import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js";

const toogleSubscription = asyncHandler( async(req , res) => {
    
     const { channelId } = req.params; 

     if(!isValidObjectId(channelId)){
        throw new ApiError(400 , "Invalid Channel Id" )
     }

     if(channelId === req.user._id.toString()){
         throw new ApiError(400, "you cannot subscribe yourselves");
     }

     const existingSub = await Subscription.findOne({ 
          subscriber: req.user._id,
          channel: channelId
      })

      if(existingSub){
        await Subscription.deleteOne({ _id: existingSub._id });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully"));

      }

      await Subscription.create({
         subscriber: req.user._id,
         channel: channelId,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, {}, "Subscribed successfully"));

} )

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
      const {channelId} = req.params

     if(!isValidObjectId(channelId)){
        throw new ApiError(400 , "Invalid Channel Id" )
     }    

     const channelExists = await User.findById(channelId);

     if(!channelExists){
         throw new ApiError(404 , "Channel not found")
     }

     const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber" , " username fullName avatar")
    
     return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        );
        

})
//controller to return a subscribed channel which user subscribed 
const getSubscribedChannels = asyncHandler( async (req,res) => {
     const { subscriberId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400 , "Invalid subscriber Id" )
     }  

    const userExists = await User.findById(subscriberId);

    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.find( { subscriber: subscriberId } ).populate( "channel" , "username fullName avatar" ) 

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
        );



} )


export { toogleSubscription , getUserChannelSubscribers , getSubscribedChannels } 
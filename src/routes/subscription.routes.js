import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toogleSubscription } from "../controllers/subscription.controller.js";


const router = Router();

router.use(verifyJWT); 
   

router.route("/c/:channelId")
        .get(getSubscribedChannels)
        .post(toogleSubscription)
 
router.route("/u/:subscriberId").get(getUserChannelSubscribers)        

export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toogleCommentLike, toogleTweetLike, toogleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toogle/v/:videoId").post(toogleVideoLike) 
router.route("/toogle/c/:commentId").post(toogleCommentLike) 
router.route("/toogle/t/:tweetId").post(toogleTweetLike) 
router.route("/videos").get(getLikedVideos)


export default router;
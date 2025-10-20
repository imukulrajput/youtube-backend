import { Router } from "express";

import { deleteVideo, getAllVideos, getVideoById, publishAVideo, tooglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();  
router.use(verifyJWT);

router.route("/")
.get(getAllVideos)
.post(
    upload.fields([
        {
                name: "videoFile",
                maxCount: 1,
        },
        {  
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
    publishAVideo
)

router.route("/:videoId")
        .get(getVideoById)
        .patch(upload.single("thumbnail") , updateVideo) 
        .delete(deleteVideo)   

router.route("/toogle/publish/:videoId").patch(tooglePublishStatus) 


export default router
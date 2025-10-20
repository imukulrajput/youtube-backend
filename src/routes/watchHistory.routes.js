import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToWatchHistory, clearWatchHistory, getWatchHistory } from "../controllers/watchHistory.controller.js";


const router = Router();

router.use(verifyJWT)   

router.route("/").get(getWatchHistory).delete(clearWatchHistory)
router.route("/:videoId").post(addToWatchHistory)


export default router
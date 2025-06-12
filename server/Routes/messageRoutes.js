import express from "express"
import { protectRoute } from "../Middleware/auth.js";
import { getMessage, getUsersFromSidebar, markMessageAsSeen } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/user", protectRoute, getUsersFromSidebar);
messageRouter.get("/:id", protectRoute, getMessage);
messageRouter.put("mark/:id", protectRoute, markMessageAsSeen);


export default messageRouter;
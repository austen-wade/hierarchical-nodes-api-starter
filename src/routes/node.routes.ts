import express from "express";
import { authentification, authorization } from "../middleware/auth.middleware";
import { NodeController } from "../controllers/node.controller";

const route = express.Router()

route.get("/", authentification, authorization(['user', 'admin']), NodeController.getNodeTree)
route.post("/", authentification, authorization(['admin']), NodeController.createNode)
route.put("/", authentification, authorization(['admin']), NodeController.updateNode)
route.delete("/", authentification, authorization(['admin']), NodeController.deleteNode)
route.get("/root", authentification, authorization(['user', 'admin']), NodeController.getRootNode)

export { route as nodeRouter }

import express from "express"
import { authentification, authorization } from "../middleware/auth.middleware"
import { NodeController } from "../controllers/node.controller"

const route = express.Router()

route.get('/tree', authentification, authorization(['user', 'admin']), NodeController.getNodeTree)

route.get('/:nodePath(*)', authentification, authorization(['user', 'admin']), NodeController.getNode)
route.post('/:nodePath(*)', authentification, authorization(['admin']), NodeController.createNode)
route.put('/:nodePath(*)', authentification, authorization(['admin']), NodeController.updateNode)
route.delete('/:nodePath(*)', authentification, authorization(['admin']), NodeController.deleteNode)

export { route as nodeRouter }

import { authentification, authorization, isTheUser } from "../middleware/auth.middleware"
import { UserController } from "../controllers/user.controller"
import * as express from 'express'

const route = express.Router()

route.get("/", authentification, authorization(['admin']), UserController.getUsers)

route.get("/:id", authentification, isTheUser, UserController.getProfile)
route.put("/:id", authentification, isTheUser, UserController.updateUser)
route.put('/:id/update-password', authentification, isTheUser, UserController.updatePassword)
route.delete("/:id/delete", authentification, authorization(['admin']), UserController.deleteUser)

export { route as userRouter }
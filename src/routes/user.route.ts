import { authentification, authorization } from "../middleware/auth.middleware"
import { UserController } from "../controllers/user.controller"
import { AuthController } from "../controllers/auth.controller"
import * as express from 'express'

const route = express.Router()

route.get("/users", authentification, authorization(['admin']), UserController.getUsers)
route.get("/profile", authentification, authorization(['admin', 'user']), AuthController.getProfile)
route.post("/signup", UserController.signUp)
route.post("/login", AuthController.login)
route.put("/update/:id", authentification, authorization(['admin', 'user']), UserController.updateUser)
route.delete("/delete/:id", authentification, authorization(['admin']), UserController.deleteUser)
route.put('/update-password', authentification, authorization(['admin', 'user']), UserController.updatePassword)

export { route as userRouter }
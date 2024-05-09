import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User.entity";
import { Encrypt } from "../helpers/encrypt";
import { UserResponse } from "../dto/user.dto";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
      }

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { email } })

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" })
      }

      const isPasswordValid = Encrypt.comparePassword(user.password, password)
      if (!user || !isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" })
      }

      const token = Encrypt.generateToken({ id: user.id })
      return res.status(200).json({ token })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Internal server error" })
    }
  }

  static async getProfile(req: Request, res: Response) {
    if (!req['currentUser']) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id: req['currentUser'].id } })

    const userResponse = new UserResponse()
    userResponse.name = user.name
    userResponse.email = user.email
    userResponse.role = user.role

    return res.status(200).json({ user: userResponse })
  }
}
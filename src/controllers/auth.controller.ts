import { Request, Response } from "express"
import { AppDataSource } from "../data-source"
import { User } from "../entity/User.entity"
import { Encrypt } from "../helpers/encrypt"
import { UserResponse } from "../dto/user.dto"
import { BadRequest, InternalServerError } from "../helpers/errors"

export class AuthController {

  static async register(req: Request, res: Response) {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return BadRequest(res, "Missing required fields")
    }

    const encryptedPassword = await Encrypt.encryptPassword(password)
    const user = new User()

    user.name = name
    user.email = email
    user.password = encryptedPassword
    user.role = role
    user.active = true

    try {
      const userRepository = AppDataSource.getRepository(User)
      await userRepository.save(user)

      const token = Encrypt.generateToken({ id: user.id })

      return res.status(201).json({
        user: new UserResponse(user), token
      })
    } catch (error) {
      return error.errno === 19
        ? BadRequest(res, 'Email already exists')
        : InternalServerError(res)
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return BadRequest(res, "Missing required fields")
      }

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { email } })

      if (!user) {
        return BadRequest(res, "Invalid email or password")
      }

      const isPasswordValid = Encrypt.comparePassword(user.password, password)
      if (!user || !isPasswordValid) {
        return BadRequest(res, "Invalid email or password")
      }

      const token = Encrypt.generateToken({ id: user.id })

      return res.status(200).json({ token })
    } catch (error) {
      console.error(error)
      return InternalServerError(res)
    }
  }
}
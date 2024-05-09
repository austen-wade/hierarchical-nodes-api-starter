import { Request, Response } from "express"
import { Encrypt } from "../helpers/encrypt"
import { User } from "../entity/User.entity"
import { AppDataSource } from "../data-source"
import { UserResponse } from "../dto/user.dto"
import * as cache from 'memory-cache'

export class UserController {
  static async signUp(req: Request, res: Response) {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required information' })
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

      const userResponse = new UserResponse()
      userResponse.name = user.name
      userResponse.email = user.email
      userResponse.role = user.role
      userResponse.active = user.active

      const token = Encrypt.generateToken({ id: user.id })

      res.status(201).json({ user: userResponse, token })
    } catch (error) {
      if (error.errno === 19) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async getUsers(req: Request, res: Response) {
    const cachedData = cache.get('users')

    if (cachedData) {
      return res.status(200).json({ users: cachedData })
    }

    const userRepository = AppDataSource.getRepository(User)
    const users = await userRepository.find()

    cache.put('users', users, 60000)
    return res.status(200).json({ users })
  }

  static async getUser(req: Request, res: Response) {
    const { id } = req.params
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ user })
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params
    const { name, email, role, active } = req.body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.name = name
    user.email = email
    user.role = role
    user.active = active

    await userRepository.save(user)

    return res.status(200).json({ user })
  }

  static async updatePassword(req: Request, res: Response) {
    const { id } = req.params
    const { password } = req.body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const encryptedPassword = await Encrypt.encryptPassword(password)
    user.password = encryptedPassword

    await userRepository.save(user)

    return res.status(200).json({ message: "Password updated" })
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await userRepository.remove(user)

    return res.status(204).json()
  }
}
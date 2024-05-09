import { Request, Response } from "express"
import { Encrypt } from "../helpers/encrypt"
import { User } from "../entity/User.entity"
import { AppDataSource } from "../data-source"
import { UserResponse } from "../dto/user.dto"
import * as cache from 'memory-cache'
import { NotFound, Unauthorized } from "../helpers/errors"
import { Store } from "../helpers/store"

export class UserController {

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
    const user = await Store.getUserById(id)

    if (!user) {
      return NotFound(res, "User not found")
    }

    return res.status(200).json({ user })
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params
    const { name, email, role, active } = req.body
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ where: { id } })

    if (!user) {
      return NotFound(res, "User not found")
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
      return NotFound(res, "User not found")
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
      return NotFound(res, "User not found")
    }

    await userRepository.remove(user)

    return res.status(204).json()
  }

  static async getProfile(req: Request, res: Response) {
    return !req['currentUser']
      ? Unauthorized(res)
      : res.status(200).json({
        user: new UserResponse(
          await Store.getUserById(req['currentUser'].id)
        )
      })
  }
}
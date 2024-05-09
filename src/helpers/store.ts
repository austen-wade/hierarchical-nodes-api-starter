import { Request } from "express"
import { AppDataSource } from "../data-source"
import { User } from "../entity/User.entity"

export class Store {

  static async getRole(id: string) {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { id },
    })
    if (!user) {
      return null
    }
    return user.role
  }

  static async getActiveUser(req: Request) {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { id: req['currentUser'].id },
    })
    return user
  }

  static async getUserById(id: string) {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { id },
    })
    return user
  }
}
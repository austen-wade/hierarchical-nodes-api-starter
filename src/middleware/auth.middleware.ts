import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
import { User } from '../entity/User.entity'
import { AppDataSource } from '../data-source'
import { Encrypt } from '../helpers/encrypt'

dotenv.config()

export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = header.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const decode = Encrypt.verifyToken(token)
  if (!decode) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  req['currentUser'] = decode

  next()
}

export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { id: req['currentUser'].id },
    })
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}
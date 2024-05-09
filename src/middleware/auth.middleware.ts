import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
import { Encrypt } from '../helpers/encrypt'
import { Store } from '../helpers/store'
import { Forbidden, InternalServerError, Unauthorized } from '../helpers/errors'

dotenv.config()

export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const header = req.headers.authorization
    if (!header) {
      return Unauthorized(res)
    }

    const token = header.split(' ')[1]
    if (!token) {
      return Unauthorized(res)
    }

    console.log({ token });
    const decode = Encrypt.verifyToken(token)
    if (!decode) {
      return Unauthorized(res)
    }

    req['currentUser'] = decode

    next()
  } catch (error) {
    return InternalServerError(res, error.message)
  }
}

export const isTheUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req['currentUser']) {
    return Unauthorized(res)
  }
  const targetId = req.params.id
  const activeUser = await Store.getActiveUser(req)

  if (activeUser.id !== targetId) {
    const role = await Store.getRole(req['currentUser'].id)

    if (!role || role !== 'admin') {
      return Forbidden(res)
    }
  }
  next()
}

export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req['currentUser']) {
      return Unauthorized(res)
    }
    const role = await Store.getRole(req['currentUser'].id)

    if (!role || !roles.includes(role)) {
      return Forbidden(res)
    }

    next()
  }
}

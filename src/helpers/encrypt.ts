import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

dotenv.config()

const { JWT_SECRET } = process.env
export class Encrypt {

  static async encryptPassword(password: string) {
    return bcrypt.hash(password, 10)
  }

  static comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }

  static generateToken(payload: Object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET)
  }

  static async decodeToken(token: string) {
    return jwt.decode(token)
  }
}
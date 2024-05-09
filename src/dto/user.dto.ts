import { User } from "../entity/User.entity"

export class UserResponse {
  name: string
  email: string
  role: string
  active: boolean

  constructor(user?: User) {
    if (user) {
      this.name = user.name
      this.email = user.email
      this.role = user.role
      this.active = user.active
    }
  }
}
import { Response } from "express"

export const BadRequest = (res: Response, message?: string) => {
  return res.status(400).json({ message: message || "Bad request" })
}

export const Unauthorized = (res: Response, message?: string) => {
  return res.status(401).json({ message: message || "Unauthorized" })
}

export const Forbidden = (res: Response, message?: string) => {
  return res.status(403).json({ message: message || "Forbidden" })
}

export const NotFound = (res: Response, message?: string) => {
  return res.status(404).json({ message: message || "Not found" })
}

export const InternalServerError = (res: Response, message?: string) => {
  return res.status(500).json({ message: message || "Internal server error" })
}

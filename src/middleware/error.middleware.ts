import { NextFunction, Request, Response } from "express"
import { InternalServerError } from "../helpers/errors"

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`Error: ${error.message}`)
  InternalServerError(res)
}
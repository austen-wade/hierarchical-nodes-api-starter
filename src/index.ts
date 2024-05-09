import { AppDataSource } from "./data-source"
import { errorHandler } from './middleware/error.middleware'
import express from 'express'
import * as dotenv from 'dotenv'
import { Response } from 'express'
import { userRouter } from './routes/user.route'
import 'reflect-metadata'
import expressWinston from 'express-winston'
import { nodeRouter } from "./routes/node.routes"
import { authRouter } from "./routes/auth.route"
import { loggerConfig } from "./middleware/logger.middleware"
import { NotFound } from "./helpers/errors"
dotenv.config()

const app = express()

app.use(express.json())
app.use(errorHandler)
app.use(expressWinston.logger(loggerConfig))

const { PORT = 3000 } = process.env

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/nodes', nodeRouter)

app.get("*", (_, res: Response) => NotFound(res))

AppDataSource.initialize().then(async () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
    console.log("Database connected")
}).catch(error => console.log(error))

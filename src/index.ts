import { AppDataSource } from "./data-source"
import { errorHandler } from './middleware/error.middleware';
import express from 'express'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { userRouter } from './routes/user.route'
import 'reflect-metadata'
import winston from 'winston'
import expressWinston from 'express-winston'
import { nodeRouter } from "./routes/node.routes";
dotenv.config()

const app = express()
app.use(express.json())
app.use(errorHandler)
app.use(expressWinston.logger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        winston.format.align(),
        winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console()],
}))

const { PORT = 3000 } = process.env

app.use('/auth', userRouter)
app.use('/nodes', nodeRouter)

app.get("*", (req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" })
});

AppDataSource.initialize().then(async () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
    console.log("Database connected")
}).catch(error => console.log(error))

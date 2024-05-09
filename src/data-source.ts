import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User.entity"
import { Node } from "./entity/Node.entity"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [User, Node],
    migrations: [],
    subscribers: [],
})

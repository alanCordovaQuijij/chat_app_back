import "reflect-metadata";
import { DataSource } from "typeorm";
import { Countries } from "./entity/entities/Countries";
import { Departments } from "./entity/entities/Departments";
import { Dependents } from "./entity/entities/Dependents";
import { Employees } from "./entity/entities/Employees";
import { Jobs } from "./entity/entities/Jobs";
import { Locations } from "./entity/entities/Locations";
import { RaiseHistory } from "./entity/entities/RaiseHistory";
import { Regions } from "./entity/entities/Regions";
import { User } from "./entity/MongoEntities/Personas";
import { Config } from "./utils/keys";
import { Chat } from "./entity/MongoEntities/Chat";
import { ChatMessage } from "./entity/MongoEntities/Chat_Message";
import { Group } from "./entity/MongoEntities/Group";
import { GroupMessage } from "./entity/MongoEntities/Group_Message";

export const AppDataSourcePostgress = new DataSource({
  type: "postgres",
  // host: "localhost",
  // port: 5432,
  // username: "postgres",
  // password: "admin",
  // database: "db_chat",
  host: Config.POSTGRES_HOST,
  port: Config.POSTGRES_PORT,
  username: Config.POSTGRES_USERNAME,
  password: Config.POSTGRES_PASSWORD,
  database: Config.POSTGRES_DATABASE,
  schema: "public",
  synchronize: false,
  logging: false,
  entities: [
    Countries,
    Departments,
    Dependents,
    Employees,
    Jobs,
    Locations,
    RaiseHistory,
    Regions,
  ],
  migrations: [],
  subscribers: [],
});

/* 
export const AppDataSourceMongo = new DataSource({
  type: "mongodb",
  host: "localhost",
  port: 27017,
  username: "fernado",
  password: "123456",
  database: "prueba",
  entities: [User],
  synchronize: true,

})
 */
export const AppDataSourceMongo = new DataSource({
  type: "mongodb",
  // host: "localhost",
  // port: 27017,
  // database: "Base_chat_local",
  host: Config.MONGO_HOST,
  port: Config.MONGO_PORT,
  database: Config.MONGO_DATABASE,
  entities: [User, Chat, ChatMessage, Group, GroupMessage],
  //useUnifiedTopology: true,
  //username: "fernado",
  //password: "123456",
  synchronize: false,
});

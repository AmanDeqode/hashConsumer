import "reflect-metadata";
import { ConnectionOptions, createConnection } from "typeorm";
import dotenv from "dotenv";
import { InitializeQueue } from "./src/queue/hash.queue";

dotenv.config();

const {
  DB_CONNECTION,
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
} = process.env;

const initializeQueue = new InitializeQueue();

const connection = async () => {
  await createConnection({
    type: DB_CONNECTION,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
  } as ConnectionOptions);
};

async function queue() {
  await initializeQueue.initialize();
  await initializeQueue.processQueue();
}

async function main() {
  await connection();
  queue();
}

main();

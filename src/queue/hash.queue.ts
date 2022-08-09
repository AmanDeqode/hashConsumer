import Bull from "bull";
import dotenv from "dotenv";
import hashConsumer from "../consumer/hash.consumer";

dotenv.config();

export class InitializeQueue {
  initialize() {
    console.log("called");
    return new Bull("upload-hash", {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    });
  }

  processQueue() {
    console.log("processQueue");
    this.initialize().process("valid-nonce", hashConsumer);
  }
}

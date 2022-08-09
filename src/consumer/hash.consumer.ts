import { Job } from "bull";
import { HashService } from "../services/hash.service";

async function hashConsumer(job: Job) {
  try {
    await new HashService().findingNonce(job);
  } catch (error) {
    throw new Error(error.message);
  }
}

export default hashConsumer;

import { Job } from "bull";
import { HashService } from "../services/hash.service";

async function hashConsumer(job: Job) {
  try {
    console.log("job", job.data.status);
    await new HashService().findingNonce(job);
  } catch (error) {
    throw new Error(error.message);
  }
}

export default hashConsumer;

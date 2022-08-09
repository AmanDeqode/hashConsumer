import { Job } from "bull";
import { HashService } from "../services/hash.service";

async function hashConsumer(job: Job) {
  try {
    console.log("job", job.data);
    const hashService = new HashService();

    hashService.findingNonce(job?.data);
  } catch (error) {
    throw new Error(error.message);
  }
}

export default hashConsumer;

import BigNumber from "bignumber.js";
import { of } from "await-of";
import { ethers, utils } from "ethers";
import { getConnection } from "typeorm";
import { Hash, ResultStatusEnum } from "../entity/hash.entity";

export class HashService {
  constructor() {}
  private hashRepository = getConnection().getRepository(Hash);

  async findingNonce(job) {
    if (job?.data && job.data.status === ResultStatusEnum.PENDING) {
      const [processRecord, processError] = await of(
        this.hashRepository.findOne({
          where: {
            id: job.data.id,
          },
        })
      );
      if (processError) throw new Error("Error in finding id");
      if (!processRecord) return {};
      if (processRecord) {
        const processJob = { ...processRecord, ...job?.data };
        const response: any = await this.getDetails(processJob);
        if (Object.keys(response).length && response.nonce) {
          console.log(response);
          const [updateDB, updateError] = await of(
            this.hashRepository.update(
              {
                id: processRecord?.id,
              },
              {
                nonce: response?.nonce,
                status: ResultStatusEnum.COMPLETED,
                output_hex: response?.outputHex,
              }
            )
          );
          if (updateError)
            throw new Error("Error in updating nonce into database");
          if (!updateDB) return {};
          if (updateDB) {
            return {
              status: ResultStatusEnum.COMPLETED,
              outputHex: response?.outputHex,
            };
          }
        }
      }
    }
  }

  async getDetails(record) {
    try {
      const { input_hex, nonce_range } = record;
      if (input_hex === null || input_hex === "") {
        return { error: "Hex is empty" };
      }
      const initialHash = new BigNumber(input_hex, 16);
      const { start_process_nonce, end_process_nonce } = nonce_range;
      let nonce = new BigNumber(start_process_nonce);
      for (
        let i = Number(start_process_nonce);
        i < Number(end_process_nonce);
        i++
      ) {
        const input = BigNumber.sum(new BigNumber(input_hex, 16), nonce);
        const hash = this.generateHash(input);
        const newHash = new BigNumber(hash, 16);
        if (initialHash.isGreaterThan(newHash)) {
          return { nonce: nonce.toString(), outputHex: hash };
        }
        nonce = BigNumber.sum(nonce, 1);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  generateHash(input) {
    const hash = input.toString(16);
    if (hash.length % 2 === 0) {
      const ether = ethers.utils.keccak256(utils.arrayify("0x" + hash));
      return ether;
    }
    const ether = ethers.utils.keccak256(utils.arrayify("0x0" + hash));
    return ether;
  }
}

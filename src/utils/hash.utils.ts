import bcrypt from "bcryptjs";

import { env } from "@/env";
import { logger } from "@/middlewares/pino-logger";

class HashingUtils {
  // define constants
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = env.SALT_ROUNDS;
  }

  // hash password
  async hashPassword(password: string): Promise<string> {
    logger.info("from hashing")
    return await bcrypt.hash(password, this.saltRounds);
  }
   async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

const hashingUtils = new HashingUtils();

export default hashingUtils;

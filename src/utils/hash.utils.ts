import bcrypt from "bcryptjs";

import { env } from "@/env";

class HashingUtils {
  // define constants
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = env.SALT_ROUNDS;
  }

  // hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }
}

const hashingUtils = new HashingUtils();

export default hashingUtils;

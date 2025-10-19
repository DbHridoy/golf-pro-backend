import type { IUser } from "@/modules/user/user.interface";

import { logger } from "@/middlewares/pino-logger";
import UserModel from "@/modules/user/user.model";

import OTPModel from "./otp.model";

export class AuthRepository {
  // Register user
  async registerUser(userData) {
    try {
      // logger.info(userData, "repostiory layer.");
      const user = new UserModel(userData);
      return await user.save();
    }
    catch (error) {
      logger.error(error, "Repository layer error check.");
    }
  }

  // Login user
  async findUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase(), isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  }

  async findUserById(userId: string, includePassword = false) {
    const query = UserModel.findOne({ _id: userId, isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    const data = await query.exec();
    // logger.info(`data from authrepo: ${JSON.stringify(data)}`);
    return data;
  };

  async matchOtp(email: string, otp: string) {
    const record = await OTPModel.findOne({ email, otp });
    return record;
  }

  async deleteOtp(id: string) {
    const record = await OTPModel.findOneAndDelete({ _id: id });
    return record;
  }

  async updateUserPassword(id: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true },
    );
  }
}

export const authRepository = new AuthRepository();

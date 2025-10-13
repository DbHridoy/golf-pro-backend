import type { IUser } from "@/modules/user/user.interface";

import { logger } from "@/middlewares/pino-logger";
import UserModel from "@/modules/user/user.model";

import OTPModel from "./otp.model";

export class AuthRepository {
  async findUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase(), isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  }

  async findUserById(userId: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ _id: userId, isActive: true });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  };

  // Create User
  async createUser(userData: Partial<IUser>): Promise<IUser | null | undefined> {
    try {
      logger.info(userData, "repostiory layer.");
      const user = new UserModel(userData);
      return await user.save();
    }
    catch (error) {
      logger.error(error, "Repository layer error check.");
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  async matchOtp({ email, otp }) {
    const record = await OTPModel.findOne({ email, otp });
    return record;
  }

  async deleteOtp(id) {
    const record = await OTPModel.findOneAndDelete({ _id: id });
    return record;
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true },
    );
  }
}

export const authRepository = new AuthRepository();

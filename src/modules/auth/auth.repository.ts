import { logger } from "@/middlewares/pino-logger";
import UserModel from "@/modules/user/user.model";

import OTPModel from "./otp.model";

export class AuthRepository {
  // Register user
  async registerUser(userData: any) {
    try {
      const user = new UserModel(userData);
      return await user.save();
    }
    catch (error) {
      logger.error(error, "Repository layer error check.");
      throw error;
    }
  }

  async updateUser(email: string, userData: any) {
    return UserModel.findOneAndUpdate({ email }, userData, { new: true });
  }

  // find user by email
  async findUserByEmail(email: string, includePassword = false) {
    logger.info(`from repository layer - email: ${email}`);
    const query = UserModel.findOne({ email });

    if (includePassword) {
      query.select("+password");
    }

    return await query.exec();
  }

  async findUserById(userId: string, includePassword = false) {
    const query = UserModel.findOne({ _id: userId });

    if (includePassword) {
      query.select("+password");
    }

    const data = await query.exec();
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

  // async findOrCreateUser(email: string, name: string) {
  //   let user = await UserModel.findOne({ email });

  //   return user;
  // }
}

export const authRepository = new AuthRepository();

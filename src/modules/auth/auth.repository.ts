import type { IUser } from "@/modules/user/user.interface";

import UserModel from "@/modules/user/user.model";

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

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }
}

export const authRepository = new AuthRepository();

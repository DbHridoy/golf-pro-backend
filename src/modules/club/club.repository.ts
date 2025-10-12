// import { NotFoundException } from "@/utils/app-error.utils";
// import { PaginationHelper } from "@/utils/pagination-helper";

// import type { IClubProfile } from "./club.interface";
// import ClubProfileModel from "./club.model";

// export class ClubProfileRepository {
//   /**
//    * Create new golfer profile
//    */
//   // async createProfile(userId: string, profileData: Partial<IClubProfile>): Promise<IClubProfile> {
//   //   const profile = new ClubProfileModel ({
//   //     userId,
//   //     ...profileData,
//   //   })();

//   //   return await profile.save();
//   // }

//   /**
//    * Find golfer profile by user ID
//    */
//   async findclubById(userId: string): Promise<IClubProfile | null> {
//     return await ClubProfileModel.findOne({ userId })
//       .populate("users", "name")
//       .populate("friends", "fullName profileImage")
//       .lean();
//   }
//   /**
//    * Find golfer profile by profile ID
//    */
//   async findById(profileId: string): Promise<IGolferProfile | null> {
//     return await GolferProfileModel.findById(profileId)
//       .populate("clubMemberships", "name description")
//       .populate("friends", "fullName profileImage")
//       .lean();
//   }

//   /**
//    * Update golfer profile
//    */
//   async updateProfile(profileId: string, updateData: Partial<IGolferProfile>): Promise<IGolferProfile> {
//     console.log(updateData, "------------------updatedata");
//     const profile = await GolferProfileModel.findByIdAndUpdate(
//       profileId,
//       { $set: updateData },
//       { new: true, runValidators: true },
//     ).lean();
//     // .populate("clubMemberships", "name description")
//     // .populate("friends", "fullName profileImage")
//     // .lean();

//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }

//     return profile;
//   }

//   /**
//    * Get paginated golfer profiles with filters
//    */
//   async getProfiles(query: any, filters: GolferProfileFilters = {}) {
//     const paginateOptions = PaginationHelper.parsePaginationParams(query);

//     // Build search filter
//     const searchFields = ["fullName", "bio", "city", "country"];
//     const filter = PaginationHelper.createSearchFilter(query, searchFields);

//     // Add custom filters
//     if (filters.gender) {
//       filter.gender = filters.gender;
//     }

//     if (filters.country) {
//       filter.country = new RegExp(filters.country, "i");
//     }

//     if (filters.city) {
//       filter.city = new RegExp(filters.city, "i");
//     }

//     if (filters.isProfilePublic !== undefined) {
//       filter.isProfilePublic = filters.isProfilePublic;
//     }

//     if (filters.hasProfileImage !== undefined) {
//       filter.profileImage = filters.hasProfileImage ? { $exists: true, $ne: null } : { $exists: false };
//     }

//     // Age filter (requires aggregation)
//     if (filters.minAge !== undefined || filters.maxAge !== undefined) {
//       const today = new Date();
//       const currentYear = today.getFullYear();

//       if (filters.maxAge !== undefined) {
//         const minBirthYear = currentYear - filters.maxAge - 1;
//         filter.dateOfBirth = { ...filter.dateOfBirth, $gte: new Date(minBirthYear, 0, 1) };
//       }

//       if (filters.minAge !== undefined) {
//         const maxBirthYear = currentYear - filters.minAge;
//         filter.dateOfBirth = { ...filter.dateOfBirth, $lte: new Date(maxBirthYear, 11, 31) };
//       }
//     }

//     const result = await GolferProfileModel.paginate(filter, {
//       ...paginateOptions,
//       populate: [
//         { path: "clubMemberships", select: "name description" },
//         { path: "friends", select: "fullName profileImage" },
//       ],
//     });

//     return PaginationHelper.formatResponse(result);
//   }

//   /**
//    * Search nearby golfers using geospatial query
//    */

//   async searchNearbyGolfers(searchParams: NearbyGolferSearch) {
//     const { latitude, longitude, radius, page = 1, limit = 10 } = searchParams;

//     const pipeline: any[] = [
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [longitude, latitude],
//           },
//           distanceField: "distance",
//           maxDistance: radius * 1000, // Convert km to meters
//           spherical: true,
//           query: {
//             isProfilePublic: true,
//             location: { $exists: true },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "clubs",
//           localField: "clubMemberships",
//           foreignField: "_id",
//           as: "clubMemberships",
//           pipeline: [{ $project: { name: 1, description: 1 } }],
//         },
//       },
//       {
//         $addFields: {
//           distanceInKm: { $divide: ["$distance", 1000] },
//         },
//       },
//       {
//         $sort: { distance: 1 },
//       },
//     ];

//     const options = {
//       page,
//       limit,
//       // customLabels: PaginationHelper.formatResponse({} as any).pagination,
//     };

//     const result = await GolferProfileModel.aggregatePaginate(
//       GolferProfileModel.aggregate(pipeline),
//       options,
//     );

//     return PaginationHelper.formatResponse(result);
//   }

//   /**
//    * Update profile image
//    */

//   async updateProfileImage(profileId: string, imageUrl: string): Promise<IGolferProfile> {
//     return await this.updateProfile(profileId, { profileImage: imageUrl });
//   }

//   /**
//    * Update cover image
//    */
//   async updateCoverImage(profileId: string, imageUrl: string): Promise<IGolferProfile> {
//     return await this.updateProfile(profileId, { coverImage: imageUrl });
//   }

//   /**
//    * Update location
//    */
//   async updateLocation(profileId: string, locationData: LocationInput): Promise<IGolferProfile> {
//     const updateData = {
//       country: locationData.country,
//       city: locationData.city,
//       address: locationData.address,
//       location: {
//         type: "Point" as const,
//         coordinates: [locationData.longitude, locationData.latitude] as [number, number],
//       },
//     };

//     return await this.updateProfile(profileId, updateData);
//   }

//   /**
//    * Check if golfer profile exists
//    */
//   async profileExists(userId: string): Promise<boolean> {
//     const profile = await GolferProfileModel.findOne({ userId }).lean();
//     return !!profile;
//   }

//   /**
//    * Delete golfer profile
//    */
//   async deleteProfile(profileId: string): Promise<boolean> {
//     const result = await GolferProfileModel.findByIdAndDelete(profileId);
//     return !!result;
//   }

//   /**
//    * Update online status
//    */
//   async updateOnlineStatus(profileId: string, isOnline: boolean): Promise<void> {
//     await GolferProfileModel.findByIdAndUpdate(profileId, {
//       isOnline,
//       lastActiveAt: new Date(),
//     });
//   }

//   /**
//    * Add friend to golfer's friend list
//    */
//   async addFriend(profileId: string, friendId: string): Promise<IGolferProfile> {
//     const profile = await GolferProfileModel.findByIdAndUpdate(
//       profileId,
//       { $addToSet: { friends: friendId } },
//       { new: true },
//     ).lean();

//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }

//     return profile;
//   }

//   /**
//    * Remove friend from golfer's friend list
//    */
//   async removeFriend(profileId: string, friendId: string): Promise<IGolferProfile> {
//     const profile = await GolferProfileModel.findByIdAndUpdate(
//       profileId,
//       { $pull: { friends: friendId } },
//       { new: true },
//     ).lean();

//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }

//     return profile;
//   }

//   /**
//    * Add club membership
//    */
//   async addClubMembership(profileId: string, clubId: string): Promise<IGolferProfile> {
//     const profile = await GolferProfileModel.findByIdAndUpdate(
//       profileId,
//       { $addToSet: { clubMemberships: clubId } },
//       { new: true },
//     ).lean();

//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }

//     return profile;
//   }

//   /**
//    * Remove club membership
//    */
//   async removeClubMembership(profileId: string, clubId: string): Promise<IGolferProfile> {
//     const profile = await GolferProfileModel.findByIdAndUpdate(
//       profileId,
//       { $pull: { clubMemberships: clubId } },
//       { new: true },
//     ).lean();

//     if (!profile) {
//       throw new NotFoundException("Golfer profile not found");
//     }

//     return profile;
//   }
// }

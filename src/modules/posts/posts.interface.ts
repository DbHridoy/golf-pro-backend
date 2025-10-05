import type { BaseDocument } from "@/utils/base-schema.utils";

export interface IPosts extends BaseDocument {
  userId: string;
  postTitle: string;
  postImage: string;
  taggedFriends: string[];
  taggedClub: string;
  likes: string[];
  comments: string[];
  isPostPublic: boolean;
}

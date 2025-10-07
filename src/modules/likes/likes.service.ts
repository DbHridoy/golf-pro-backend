import { likeRepository } from "./likes.repository";

class LikeService {

    async makeLike(data) {
        const like=await likeRepository.makeLike(data)
        return like
    }

    async toggleLikeStatus(data) {
        const like=await likeRepository.toggleLikeStatus(data)
        return like
    }

    async getAllLikesForPost(postId) {
        const likes=await likeRepository.getAllLikesForPost(postId)
        return likes
    }
}

export const likeService = new LikeService();
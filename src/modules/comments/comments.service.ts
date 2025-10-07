import { commentRepository } from "./comments.repository";

class CommentService {
  async createNewComment(data) {
    const comment = await commentRepository.createNewCommentIntoDB(data);
    return comment;
  }

  async getAllCommentsForPost(postId) {
    const comments = await commentRepository.getAllCommentsForPost(postId);
    return comments;
  }
}
export const commentService = new CommentService();

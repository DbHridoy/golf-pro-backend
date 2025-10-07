import CommentModel from "./comments.model";

class CommentRepository {
  async createNewCommentIntoDB(data) {
    const comment = new CommentModel(data);
    return comment.save();
  }

  async getAllComments() {
    const comments = await CommentModel.find({}).lean();
    return comments;
  }

  async getAllCommentsForPost(postId) {
    const comments = await CommentModel.find({ postId }).lean();
    return comments;
  }
}

export const commentRepository = new CommentRepository();

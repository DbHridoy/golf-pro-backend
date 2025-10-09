import PostModel from "./posts.model";

class PostRepository {

  async getSinglePost(postId) {
    const post = await PostModel.findOne({ _id: postId }).lean();
    return post;
  }
  async getAllPosts() {
    const posts = await PostModel.find({}).lean();
    return posts;
  }

  async getAllPostsForUser(userId) {
    const posts = await PostModel.find({ userId }).lean();
    return posts;
  }

  async togglePostStatus(postId, isActive) {
    const post = await PostModel.findOneAndUpdate({ _id: postId }, { isActive }, { new: true }).lean();
    return post;
  }
}

export const postRepository = new PostRepository();

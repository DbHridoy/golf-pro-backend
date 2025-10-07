import PostModel from "./posts.model";

class PostRepository {
  async getAllPosts() {
    const posts = await PostModel.find({}).lean();
    return posts;
  }

  async getAllPostsForUser(userId) {
    const posts = await PostModel.find({ userId }).lean();
    return posts;
  }
}

export const postRepository = new PostRepository();

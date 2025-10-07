import LikeModel from "./likes.model"

class LikeRepository{

    async findLike(data){
        const like=await LikeModel.findOne(data)
        return like
    }
    async makeLike(data){
        const like=await LikeModel.create(data)
        return like
    }

    async toggleLikeStatus(data){
        const like=await this.findLike(data)
        const newlike=await LikeModel.findOneAndUpdate(like,{isLike:!like.isLike},{new:true})
        return newlike
    }

    async getAllLikesForPost(postId){
        const likes=await LikeModel.find({postId,isLike:true}).lean()
        return likes
    }

}

export const likeRepository=new LikeRepository()
import z from "zod";

export const CommentSchemaGeneric=z.object({
    comment:z.string().trim().min(1,"Comment cannot be empty"),
    userId:z.string().trim().min(1,"User id cannot be empty"),
    postId:z.string().trim().min(1,"Post id cannot be empty")
})
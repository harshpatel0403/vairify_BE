import mongoose from "mongoose";

const usersPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: String,
    description: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            text: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UsersPost = mongoose.model("UsersPost", usersPostSchema);

export default UsersPost;

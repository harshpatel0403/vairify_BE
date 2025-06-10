import mongoose from "mongoose";

const userGallerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  images: [
    {
      image: {
        type: String,
        required: true,
      },
      comments: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          commentText: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
},
{
  timestamps: true,
});

const UserGallery = mongoose.model("UserGallery", userGallerySchema);

export default UserGallery;

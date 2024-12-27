import mongoose from "mongoose";

const favouriteSchema  = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  favourite_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
},
{
  timestamps: true,
});

const Favourite  = mongoose.models.Favourite  || mongoose.model("favourite", favouriteSchema );

export default Favourite;

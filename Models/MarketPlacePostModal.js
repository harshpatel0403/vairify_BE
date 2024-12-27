import moment from "moment";
import mongoose from "mongoose";

const marketPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
    },
    location: {
      type: String,
    },
    category: {
      type: String,
    },
    time: {
      from: String,
      to: String,
    },
    date: {
      from: String,
      to: String,
    },
    message: {
      type: String,
    },
    tokensavailable: {
      type: String,
    },
    frequency: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
    },
    totalGRT: {
      type: String,
    },
    totalpost: {
      type: String,
    },
    featurelisting: {
      type: Boolean,
      default: false,
    },
    currentpost: {
      type: Number,
    },
    typeofbusiness: {
      type: String
    },
    age: {
      type: String
    },
    orientation: {
      type: String
    },
    gender: {
      type: String
    },
    user_type: {
      type: String,
      default: "",
    },
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
    customCreatedAt: {
      type: String,
      default: moment().format("DD/MM/YYYY, h:mm:ss"),
    },
    customUpdatedAt: {
      type: String,
      default: moment().format("DD/MM/YYYY, h:mm:ss"),
    },
  },
  {
    timestamps: true,
  }
);

const MarketPlacePost = mongoose.model("marketPlacePost", marketPostSchema);

export default MarketPlacePost;

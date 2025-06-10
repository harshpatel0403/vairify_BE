import mongoose from "mongoose"

const vairifyNowSchema = new mongoose.Schema({
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
    city: {
        type: String,
    },
    radious: {
        type: String,
    },
    gender: {
        type: String,
    },
    orientation: {
        type: String,
    },
    venue: {
        type: String,
    },
    isAvailable: {
        type: Boolean
    },
    trurevu: {
        from: String,
        to: String,
    },
    inquiry: {
        type: String,
    },
    service: {
        type: String,
    },
    specialty: {
        type: String,
    },
    typespecialty: {
        type: String,
    },
    advancedservices: [
        {
        services: String,
        type: String,
        },
    ],
    favoriteStatus: {
        type: Boolean,
    },
    searchname: {
        type: String,
    },
    priceoffered: {
        type: String,
    },
    catagory: {
        type: String,
    },
    invitee: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          status: {
            type: String,
            default: "pending",
          },
        },
      ],
    build: String,
    height: String,
    eyesColor: String,
    hairColor: String,
    hairLength: String,
    weight: String,
    piercings: String,
    pubicHair: String,
    breastAppearance: String,
    breastType: String,
    tattoos: String,
    },
    {
    timestamps: true,
    }
)

const VairifyNow = mongoose.model("VarifyNow", vairifyNowSchema);
export default VairifyNow;
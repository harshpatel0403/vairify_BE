import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    verificationToken: String,
    smsCode: String,
    status: {
        type: String,
        default: "invited"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
  timestamps: true,
});

const DateGuardMember = mongoose.model("DateGuardMember", memberSchema);
export default DateGuardMember
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  groupToken: String,
  members: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DateGuardMember"
    },
    status: String, // 'joined' or 'Invited'
    smsCode: String,
    verificationToken: String,
  }]
},
{
  timestamps: true,
});

const DateGuardGroup = mongoose.model("DateGuardGroup", groupSchema);

export default DateGuardGroup;

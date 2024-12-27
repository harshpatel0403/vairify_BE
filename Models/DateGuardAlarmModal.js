import mongoose from "mongoose";

const alarmSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "DateGuardGroup" },
  hours: String,
  minutes: String,
  seconds: String,
  meridiem: String,
  alarmDelay: Number,
  timerStartTime: Date,
  alarmDisarmed: Date,
  alarmDecoyed: Date,
  proof: {
    message: String,
    file: String,
    path: String,
  },
  location: {
    latitude: String,
    longitude: String
  },
  members: [{
    memberId: mongoose.Schema.Types.ObjectId,
    socketId: String,
    status: String,
  }],
  chat: [
    {
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'DateGuardMember' },
      message: String,
      dateTime: Date
    }
  ]
},
{
  timestamps: true,
})


const DateGuardAlarms = mongoose.model("DateGuardAlarms", alarmSchema);

export default DateGuardAlarms;

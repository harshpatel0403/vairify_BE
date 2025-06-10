import mongoose from "mongoose";

const CalendarSettings = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestRules: {
      type: String,
      enum: ["Scheduled", "Request", "Both"],
    },
    bufferTime: {
      day: String,
      hr: String,
      min: String,
    },
    blackOutPeriod: {
      day: String,
      hr: String,
      min: String,
    },
    blackOutPeriodStatus: {
      type: String,
      default: true,
    },
    availableTime: {
      type: String,
    },
    notificationRule: {
      status: String,
      color: String,
    },
    member: [
      {
        VIAid: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CalendarSetting = mongoose.model("calendarSetting", CalendarSettings);

export default CalendarSetting;

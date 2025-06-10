import mongoose from "mongoose";

const Days = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  start: {
    type: String,
  },
  end: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: true,
  });

const CalendarSchedule = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancellation: {
      type: String,
    },

    location: {
      address: String,
      addressLine1: String,
      landmark: String,
      lat: String,
      lng: String,
      _id: String,
    },
    venue: String,
    date: {
      start: String,
      end: String,
    },
    days: [Days],
    status: {
      type: String,
      enum: ["active", "in-active"],
    },
    color: {
      type: String,
    },
    nameSchedule: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const calendarSchedule = mongoose.model("calendarSchedule", CalendarSchedule);

export default calendarSchedule;

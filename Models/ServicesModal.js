import mongoose from "mongoose";

const businessDaySchema = new mongoose.Schema({
  fromTime: {
    type: String,
  },
  fromZone: {
    type: String,
  },
  toTime: {
    type: String,
  },
  toZone: {
    type: String,
  },
},
{
  timestamps: true,
});

const servicesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  services: [
    {
      servicesName: { type: String, required: true },
      currency: String,
      service: String,
      amount: String,
      type: { type: String }
    },
  ],
  serviceType: [
    {
      type: String,
    },
  ],
  hourlyRates: [
    {
      time: String,
      incall: String,
      outcall: String,
      currency: String,
    },
  ],
  user_type: {
    type: String,
    default: "",
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  businessHourlyRates: [
    {
      hour: String,
      rate: String,
    },
  ],
  businessday: {
    Sunday: businessDaySchema,
    Monday: businessDaySchema,
    Tuesday: businessDaySchema,
    Wednesday: businessDaySchema,
    Thursday: businessDaySchema,
    Friday: businessDaySchema,
    Saturday: businessDaySchema,
  },
  currency: {
    type: String,
  },
});

const Services = mongoose.model("Services", servicesSchema);

export default Services;

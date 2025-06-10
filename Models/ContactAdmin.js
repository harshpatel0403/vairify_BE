import mongoose from "mongoose";

const contactAdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ContactAdmin = mongoose.model("ContactAdmin", contactAdminSchema);

export default ContactAdmin;

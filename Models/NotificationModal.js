import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  type: {
    type: String,
    enum: ['VAIRIFY_NOW', 'LOCATION_REQUEST', 'VAIRIPAY', 'MARKETPLACE_FEED_POST', 'APPOINTMENT_REQUEST', 'INVITATION_REQUEST', 'CHAT', "TRUREVU"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false, // Initially, the notification is marked as unread
  },
  metadata: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;

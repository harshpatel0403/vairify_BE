import User from "../Models/UserModal.js";
import Notification from "../Models/NotificationModal.js";
import mongoose from "mongoose";


export const newNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a notification.' });
  }
};


export const getNotification = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ receiverId: new mongoose.Types.ObjectId(userId) }, {}, { sort: { createdAt: -1 } }).populate("senderId");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};


export const markNotification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark the notification as read.' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.findByIdAndRemove(notificationId);
    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the notification.' });
  }
};

export const subscribeNotification = async (req, res) => {
  const subscription = req.body
  const userId = req?.user?._id

  if (!userId) {
    return res.status(400).json({ 'success': false, message: "User not found!" })
  }

  await User.findOneAndUpdate({ _id: userId }, { $addToSet: { notificationTokens: subscription } }, { new: true })

  res.status(200).json({ 'success': true })
}

export const unsubscribeNotification = async (req, res) => {
  const subscription = req.body
  const userId = req?.user?._id

  if (!userId) {
    return res.status(400).json({ 'success': false, message: "User not found!" })
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $pull: { notificationTokens: subscription } },
    { new: true }
  )

  if (!updatedUser) {
    return res.status(404).json({ 'success': false, message: "User not found!" })
  }

  res.status(200).json({ 'success': true })
}
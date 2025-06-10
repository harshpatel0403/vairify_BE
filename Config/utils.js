import webpush from 'web-push'
import User from '../Models/UserModal.js';
import Notification from '../Models/NotificationModal.js';
import Stripe from "stripe";

const { STRIPE_KEY } = process.env;
const stripe = Stripe(STRIPE_KEY);


export const pushNotification = async (userId, data) => {
    try {
        if (!userId) {
            return Promise.reject();
        }
        const user = await User.findById(userId)
        if (!user?._id) { return Promise.reject(); }

        const notificationTokens = user?.notificationTokens || [];
        const payload = JSON.stringify(data)

        for (let token of notificationTokens) {
            try {
                let result = await webpush.sendNotification(token, payload);
                // console.log(result)
            } catch (error) {
                // console.log(error)
            }
        }

        return Promise.resolve()

    } catch (error) {
        return Promise.reject(error)
    }
}

export const sendNotification = async (senderId, receiverId, type, title, description, metadata={}) => {
    try{
        const user = await User.findById(receiverId);
        if(user?.pushNotification === false){
            return;
        }
        let notification = new Notification({
            senderId,
            receiverId,
            type,
            title,
            description,
            metadata
        })
        await notification.save()
        await pushNotification(receiverId, { title, body: description })
    }catch(error){
        console.log(error)
    }
}

export const cancelSubscription = async (subscriptionId) => {
    try{
        const subscription = await stripe.subscriptions.update(
            subscriptionId,
            {
              cancel_at_period_end: true,
            }
          );
          Promise.resolve(subscription)
    }catch(error){
        console.log(error)
        Promise.reject(error)
    }
}
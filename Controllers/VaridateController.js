import mongoose from "mongoose";
import Appointment from "../Models/AppointmentModal.js";
import Reviews from '../Models/ReviewModal.js'
import User from "../Models/UserModal.js";
import { sendNotification } from "../Config/utils.js";
import Follower from "../Models/FollowerModal.js";
import MarketPlace from "../Models/MarketPlaceModal.js";
import Notification from "../Models/NotificationModal.js";
import moment from "moment";
import { uploadToS3 } from "../utils/awsS3Functions.js";

export const saveAppointment = async (req, res) => {
    try {
        // var { data } = req.body
        var data = JSON.parse(req.fields.data)
        const file = req.files || []
        const folderName = "manualSelfies";

        const { startDateTime, type, clientId, companionId, clientStatus, companionStatus, service } = data
        if (!startDateTime || !type || !clientId || !companionId || !clientStatus || !companionStatus) {
            return res.status(400).json({ error: "Invalid Request!" })
        }

        const user = await User.findById(clientId)

        let image;
        if (file.length > 0) {
            await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimeType)
                .then((res) => {
                    image = res;
                    console.log(res, "Image link")
                })
                .catch((err) => {
                    console.log("Error Upload manualSelfies", err);
                });

            data.manualSelfie = {
                file: image,
                // file: file.filename,
                path: ""
            }
        }

        data.service = {
            servicesName: data.service || ''
        }

        const appointment = new Appointment(data)
        console.log(file, appointment, "file creagte data")

        await appointment.save();

        if (type === "vairify-now") {
            await sendNotification(
                clientId,
                companionId, 'VAIRIFY_NOW',
                `New vairify now request`,
                `${user?.name} has requested a new vairify now.`
            );
        } else {
            await sendNotification(
                clientId,
                companionId, 'APPOINTMENT_REQUEST',
                `New Appointment request`,
                `${user?.name} has requested a new appointment.`
            );
        }


        return res.status(200).json(appointment)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getAppointments = async (req, res) => {
    const { userId } = req.params
    const all = req?.query?.all

    const user = await User.findById(userId)

    if (!user) {
        return res.status(400).send({ error: "User not found" })
    }

    const { user_type } = user
    var filter = {}
    if (user_type === 'client-hobbyist') {
        filter = {
            clientId: new mongoose.Types.ObjectId(userId),
            companionStatus: { $ne: "Rejected" },
            $or: [
                { clientStatus: 'Requested' },
                // { clientStatus: 'Cancel' },
                { clientStatus: 'Sign Pending' },
                { clientStatus: 'Signedrs' }]
        }
    }

    if (user_type === 'agency-business' || user_type === 'companion-provider') {
        filter = {
            companionId: new mongoose.Types.ObjectId(userId),
            $or: [
                { companionStatus: 'Pending' },
                { companionStatus: 'Signed' },
                // { companionStatus: 'Rejected' },
                { companionStatus: 'Modified' }]
        }
    }

    if (Object.keys(filter).length <= 0) {
        return res.status(400).send({ error: 'Invalid user role' })
    }

    const currentDate = new Date();

    filter = {
        ...filter,
        $and: [
            {
                type: { $ne: 'vai-now' },
            },
            {
                type: { $ne: 'vairify-now' },
            }
        ]
    }

    if (all !== 'true') {
        filter.startDateTime = { $gte: currentDate }
    }

    const appointments = await Appointment.aggregate([
        {
            $match: filter
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'companionId',
                foreignField: '_id',
                as: 'companionId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $unwind: "$clientId",
        },
        {
            $unwind: "$companionId",
        },
    ])

    return res.send(appointments)
}

export const getVaiNowAppointments = async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
        return res.status(400).send({ error: "User not found" })
    }

    var filter = {
        $or: [
            { type: 'vai-now' },
            { type: 'vairify-now' }
        ]
    }

    const { user_type } = user
    if (user_type == 'client-hobbyist') {
        filter.clientId = user?._id
    } else {
        filter.companionId = user?._id
    }
    const appointments = await Appointment.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'users',
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'companionId',
                foreignField: '_id',
                as: 'companionId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $unwind: "$clientId",
        },
        {
            $unwind: "$companionId",
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    // for (let index = 0; index < appointments.length; index++) {
    //     const currentTime = moment()
    //     const appointment = appointments[index];
    //     const startTime = moment(appointment.startDateTime);
    //     const duration = appointment.duration;
    //     const endTime = startTime.clone().add(duration, 'minutes');
    //     if (currentTime.isAfter(endTime)) {
    //         const updatedAppointment = await Appointment.findByIdAndUpdate(
    //             appointment._id,
    //             {
    //                 companionStatus: "Rejected",
    //                 clientStatus: "Rejected",
    //             },
    //             { new: true }
    //         );

    //         appointments[index].companionStatus = updatedAppointment.companionStatus;
    //         appointments[index].clientStatus = updatedAppointment.clientStatus;
    //     }
    // }

    return res.send(appointments)
}

export const getVaiCheckAppointments = async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
        return res.status(400).send({ error: "User not found" })
    }

    var filter = {
        $or: [
            { type: 'vai-check' },
        ]
    }

    const { user_type } = user
    if (user_type == 'client-hobbyist') {
        filter.clientId = user?._id
    } else {
        filter.companionId = user?._id
    }

    const appointments = await Appointment.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'users',
                localField: 'clientId',
                foreignField: '_id',
                as: 'clientId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'companionId',
                foreignField: '_id',
                as: 'companionId',
                pipeline: [
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "reviewee",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                        }
                    }
                ],
            }
        },
        {
            $unwind: "$clientId",
        },
        {
            $unwind: "$companionId",
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    // for (let index = 0; index < appointments.length; index++) {
    //     const currentTime = moment()
    //     const appointment = appointments[index];
    //     const startTime = moment(appointment.startDateTime);
    //     const duration = appointment.duration;
    //     const endTime = startTime.clone().add(duration, 'minutes');
    //     if (currentTime.isAfter(endTime)) {
    //         const updatedAppointment = await Appointment.findByIdAndUpdate(
    //             appointment._id,
    //             {
    //                 companionStatus: "Rejected",
    //                 clientStatus: "Rejected",
    //             },
    //             { new: true }
    //         );

    //         appointments[index].companionStatus = updatedAppointment.companionStatus;
    //         appointments[index].clientStatus = updatedAppointment.clientStatus;
    //     }
    // }

    return res.send(appointments)
}

export const getUpcomingAppointments = async (req, res) => {
    try {
        const { userId } = req.params
        const all = req?.query?.all

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }

        const { user_type } = user

        const currentDate = new Date();

        var filter = {
            clientStatus: 'Scheduled'
        }

        if (!all) {
            filter['$and'] = [
                {
                    type: { $ne: 'vai-now' },
                },
                {
                    type: { $ne: 'vairify-now' },
                }
            ]
        }

        if (user_type == 'client-hobbyist') {
            filter.clientId = user?._id
        } else {
            filter.companionId = user?._id
        }

        if (all !== 'true') {
            filter.startDateTime = { $gte: currentDate }
        }

        const appointments = await Appointment.aggregate([
            {
                $match: filter
            },
            {
                $sort: { startDateTime: 1 }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientId',
                    pipeline: [
                        {
                            $lookup: {
                                from: "reviews",
                                localField: "_id",
                                foreignField: "reviewee",
                                as: "reviews",
                            },
                        },
                        {
                            $addFields: {
                                avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                            }
                        }
                    ],
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'companionId',
                    foreignField: '_id',
                    as: 'companionId',
                    pipeline: [
                        {
                            $lookup: {
                                from: "reviews",
                                localField: "_id",
                                foreignField: "reviewee",
                                as: "reviews",
                            },
                        },
                        {
                            $addFields: {
                                avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                            }
                        }
                    ],
                }
            },
            {
                $unwind: "$clientId",
            },
            {
                $unwind: "$companionId",
            },
        ]);

        return res.status(200).send(appointments)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message })
    }
}

export const getPastAppointments = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }

        const currentDate = new Date();

        var filter = {
            // clientStatus: 'Scheduled',
            $and: [
                {
                    type: { $ne: 'vai-now' },
                },
                {
                    type: { $ne: 'vairify-now' },
                }
            ],
            $or: [
                {
                    startDateTime: { $lte: currentDate }
                },
                {
                    clientStatus: 'Cancel'
                },
                {
                    companionStatus: 'Rejected'
                }
            ]
        }

        const { user_type } = user

        if (user_type == 'client-hobbyist') {
            filter.clientId = user?._id
        } else {
            filter.companionId = user?._id
        }

        const appointments = await Appointment.aggregate([
            {
                $match: filter
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'clientId',
                    pipeline: [
                        {
                            $lookup: {
                                from: "reviews",
                                localField: "_id",
                                foreignField: "reviewee",
                                as: "reviews",
                            },
                        },
                        {
                            $addFields: {
                                avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                            }
                        }
                    ],
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'companionId',
                    foreignField: '_id',
                    as: 'companionId',
                    pipeline: [
                        {
                            $lookup: {
                                from: "reviews",
                                localField: "_id",
                                foreignField: "reviewee",
                                as: "reviews",
                            },
                        },
                        {
                            $addFields: {
                                avgRating: { $round: [{ $avg: "$reviews.rating" }, 1] }
                            }
                        }
                    ],
                }
            },
            {
                $unwind: "$clientId",
            },
            {
                $unwind: "$companionId",
            },
        ])

        return res.send(appointments)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message })
    }
}

export const getAppointment = async (req, res) => {
    const { appointmentId } = req.params

    const appointment = await Appointment.findById(appointmentId).populate('clientId').populate('companionId')

    if (!appointment) {
        return res.status(404).send({ error: "Appointment not found" })
    }

    return res.send(appointment)
}

export const updateAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.params
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }
        const { user_type } = user
        const appointment = await Appointment.findById(appointmentId)
        if (user_type === 'client-hobbyist' && appointment?.clientId?.toString() !== userId) {
            return res.status(400).send({ error: 'You do not have permission to update this appointment' })
        }
        if ((user_type === 'agency-business' || user_type === 'companion-provider') && appointment?.companionId?.toString() !== userId) {
            return res.status(400).send({ error: 'You do not have permission to update this appointment' })
        }
        const file = req.files || [];
        var data = req.fields;

        var image;
        const folderName = "manualSelfies";
        if (file.length > 0) {
            await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
                .then((res) => {
                    image = res;
                })
                .catch((err) => {
                    console.log("Error Upload manualSelfies", err);
                });
            data.manualSelfieCompanion = {
                file: image,
                path: ""
            }
        }
        const appt = await Appointment.findById(appointmentId);
        if (!appt) {
            return res.status(400).send({ error: "Appointment not found" })
        }
        if (appt.type == 'vairify-now' && data.clientStatus === 'Scheduled' && data.companionStatus === 'Scheduled') {
            const resp = await User.updateOne({ _id: appt?.companionId?.toString() }, { $set: { ['vaiNowAvailable.duration']: 0 } })
            console.log(resp, ' <== I am response of the update...')
        }
        const response = await Appointment.findOneAndUpdate({ _id: appointmentId }, {
            $set: data
        }, { new: true }).populate('companionId').populate('clientId')
        if ((data?.clientStatus === "Sign Pending") && (data?.companionStatus === "Signed")) {
            await sendNotification(response?.companionId?._id, response?.clientId?._id, "APPOINTMENT_REQUEST", "Appointment request updated", `${response?.companionId?.name} has updated the appointment`)
        }
        if ((data?.companionStatus === "Rejected")) {
            if (response?.type === "vairify-now") {
                await sendNotification(response?.companionId?._id, response?.clientId?._id, "VAIRIFY_NOW", "Vairify now request rejected", `${response?.companionId?.name} has rejected the vairify now appointment`)
            } else {
                await sendNotification(response?.companionId?._id, response?.clientId?._id, "APPOINTMENT_REQUEST", "Appointment request rejected", `${response?.companionId?.name} has rejected the appointment`)
            }
        }
        if ((data?.clientStatus === "Cancel")) {
            await sendNotification(response?.clientId?._id, response?.companionId?._id, "APPOINTMENT_REQUEST", "Appointment request cancelled", `${response?.clientId?.name} has rejected the appointment`)
        }
        if ((data?.clientStatus === "Scheduled") && (data?.companionStatus === "Scheduled")) {
            if (response?.type === "vairify-now") {
                await sendNotification(response?.companionId?._id, response?.clientId?._id, "VAIRIFY_NOW", "Vairify now request updated", `${response?.companionId?.name} has updated the vairify now appointment`)
            } else {
                await sendNotification(response?.clientId?._id, response?.companionId?._id, "APPOINTMENT_REQUEST", "Appointment request updated", `${response?.clientId?.name} has updated the appointment`)
            }
        }
        if ((data?.vaiCheckStatus?.clientStatus === "Verified") && (data?.vaiCheckStatus?.companionStatus === "Pending")) {
            await sendNotification(response?.clientId?._id, response?.companionId?._id, "VAIRIFY_NOW", "Vairify now request verified", `${response?.clientId?.name} has verified the vairify now appointment`)
        }
        if ((data?.vaiCheckStatus?.clientStatus === "Verified") && (data?.vaiCheckStatus?.companionStatus === "Verified")) {
            await sendNotification(response?.companionId?._id, response?.clientId?._id, "VAIRIFY_NOW", "Vairify now request verified", `${response?.companionId?.name} has verified the vairify now appointment`)
        }
        return res.send(response)
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const postReview = async (req, res) => {
    try {
        const { userId, appointmentId, revieweeId } = req.params
        const { rating, message, puncutality, etequette, attitude, paid } = req.body

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }

        const reviewee = await User.findById(revieweeId)

        if (!reviewee) {
            return res.status(400).send({ error: "User not found" })
        }

        const { user_type } = user

        const appointment = await Appointment.findById(appointmentId)

        if (user_type === 'client-hobbyist' && appointment?.clientId?.toString() !== userId) {
            return res.status(400).send({ error: 'You do not have permission to update this appointment' })
        }

        if ((user_type === 'agency-business' || user_type === 'companion-provider') && appointment?.companionId?.toString() !== userId) {
            return res.status(400).send({ error: 'You do not have permission to update this appointment' })
        }

        let existing = await Reviews.find({ reviewee: revieweeId, reviewer: userId, appointment: appointmentId })
        if (existing && existing.length > 0) {
            return res.status(400).send({ error: 'Your reviews are already recorded.' })
        }

        const response = await Reviews.create({
            reviewer: userId,
            reviewee: revieweeId,
            rating: rating,
            message,
            puncutality, etequette, attitude,
            appointment: appointmentId
        })

        const averageReview = await Reviews.aggregate([
            {
                $match: {
                    reviewee: new mongoose.Types.ObjectId(revieweeId)
                }
            },
            {
                $group: {
                    _id: "$reviewee",
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ])

        if (averageReview?.[0]) {
            await User.findByIdAndUpdate(revieweeId, { averageRating: (averageReview[0]?.averageRating || 0)?.toFixed(1) })
        }

        // send notification to all followers with verified rule
        const followers = await Follower.find({ userId: revieweeId, follower_id: { $ne: userId } }).populate('userId');

        for (let follower of followers) {
            if (follower?.isNotifyWhenNewReview === true) {
                sendNotification(revieweeId, follower?.follower_id, "TRUREVU", "Trurevu updated", `${follower?.userId?.name} trurevu has been updated!`)
            }
        }

        return res.send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error.message })
    }
}

export const getReviews = async (req, res) => {
    try {
        const { userId } = req.params

        const filter = {
            $or: [{
                reviewer: userId
            }, {
                reviewee: userId
            }]
        }

        const response = await Reviews.find(filter).populate('reviewer').populate('reviewee').exec()

        return res.send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error.message })
    }
}

export const appointmentsCount = async (req, res) => {
    const { id } = req.params;

    try {

        const user = await User.findById(id)

        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }

        const currentDate = new Date();

        var filter = {
            clientStatus: 'Scheduled',
            $and: [
                {
                    type: { $ne: 'vai-now' },
                },
                {
                    type: { $ne: 'vairify-now' },
                }
            ],
        }

        const { user_type } = user

        if (user_type == 'client-hobbyist') {
            filter.clientId = user?._id
        } else {
            filter.companionId = user?._id
        }

        const past = await Appointment.countDocuments({
            ...{ ...filter, clientStatus: { $exists: true } },
            $or: [
                {
                    startDateTime: { $lte: currentDate }
                },
                {
                    clientStatus: 'Cancel'
                },
                {
                    companionStatus: 'Rejected'
                }
            ]
        });
        const upcoming = await Appointment.countDocuments({ ...filter, startDateTime: { $gte: currentDate } });

        if (user_type === 'client-hobbyist') {
            filter = {
                clientId: new mongoose.Types.ObjectId(id),
                companionStatus: { $ne: "Rejected" },
                $or: [
                    { clientStatus: 'Requested' },
                    // { clientStatus: 'Cancel' },
                    { clientStatus: 'Sign Pending' },
                    { clientStatus: 'Signedrs' }]
            }
        }

        if (user_type === 'agency-business' || user_type === 'companion-provider') {
            filter = {
                companionId: new mongoose.Types.ObjectId(id),
                $or: [
                    { companionStatus: 'Pending' },
                    { companionStatus: 'Signed' },
                    // { companionStatus: 'Rejected' },
                    { companionStatus: 'Modified' }
                ]
            }
        }
        const pending = await Appointment.countDocuments({
            ...filter, startDateTime: { $gte: currentDate }, $and: [
                {
                    type: { $ne: 'vai-now' },
                },
                {
                    type: { $ne: 'vairify-now' },
                }
            ],
        });


        const invitationQuery = { userId: user?._id, inquiry: "Invitation" };
        let invitation = 0;
        if (user_type == "client-hobbyist") {
            invitation = await MarketPlace.countDocuments(invitationQuery);
        } else {
            invitation = await MarketPlace.find({ "invitee.id": user?._id }).populate(
                "userId",
                "affiliate_url business_name business_type bussiness_vai country email name gender profilePic user_type vaiID"
            );;
            let invitationCount = 0
            invitation?.map((item, index) => {
                var isCancelled = false;
                item.invitee.map((invitee) => {
                    if (invitee?.id?.equals(user?._id)) {
                        if (invitee.status === "cancel") {
                            isCancelled = true;
                        }
                    }
                });
                if (!isCancelled) {
                    invitationCount += 1
                }
            })
            invitation = invitationCount
        }

        let vaiNowFilter = {
            $or: [
                { type: 'vai-now' },
                { type: 'vairify-now' }
            ]
        }

        if (user_type == 'client-hobbyist') {
            vaiNowFilter.clientId = user?._id
        } else {
            vaiNowFilter.companionId = user?._id
        }

        const vairifynow = await Appointment.countDocuments(vaiNowFilter);

        const notifications = await Notification.countDocuments({ receiverId: user?._id });


        const result = {
            upcoming,
            pending,
            past,
            invitation,
            vairifynow,
            notifications
        }

        return res.send(result);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message })
    }
};
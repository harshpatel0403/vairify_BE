import VairifyNow from "../Models/VairifyNowModal.js";
import Services from "../Models/ServicesModal.js";
import profileDetails from "../Models/ProfileModal.js";
import Appointment from "../Models/AppointmentModal.js";
import Users from '../Models/UserModal.js'
import moment from "moment";
import { sendNotification } from "../Config/utils.js";
import mongoose from "mongoose";

export const isAvailableNow = async (req, res) => {
  const { userId, venue, sharedLocation } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const profile = await profileDetails.findById(userId);
    if (!profile) {
      return res.status(404).json({ message: "profile not found." });
    }
    profile.venue = venue;
    profile.sharedLocation = sharedLocation;
    profile.isAvailable = true;
    const updateProfile = await profileDetails.findByIdAndUpdate(userId, profile, {
      new: true,
    });
    if (!updateProfile) {
      return res.status(404).json({ error: "profile not found." });
    }

    res.status(200).json({ updateProfile, message: "Update successfully" })
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};

export const createVairifyNowSearch = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const VairifyNowSearch = new VairifyNow({ ...req.body, status: 'pending' });

    await VairifyNowSearch.save();

    res.status(200).json({ message: "Save successfully", MarketSearch });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};
export const updateVairifyNowSearch = async (req, res) => {
  const { id } = req.params;
  const { inviteeId, inviteeStatus } = req.body;
  try {
    const query = {
      _id: id,
      "invitee.id": inviteeId,
    };

    const update = {
      $set: {
        "invitee.$.status": inviteeStatus,
      },
    };
    const Vairify = await VairifyNow.findById(id);
    if (!Vairify) {
      return res.status(404).json({ message: "VairifyNow not found." });
    }

    if (!inviteeId) {
      const VairifyNowSearch = await VairifyNow.findByIdAndUpdate(id, { ...req.body, status: 'pending' }, {
        new: true,
      });
      if (!VairifyNowSearch) {
        return res.status(404).json({ error: "VairifyNowSearch not found." });
      }

      res.status(200).json({ MVairifyNowSearch, message: "Update successfully" });
    } else {
      const VairifyNowSearch = await VairifyNow.updateMany(query, update, {
        new: true,
      });
      if (!VairifyNowSearch) {
        return res.status(404).json({ error: "VairifyNowSearch not found." });
      }

      res.status(200).json({ VairifyNowSearch, message: "Update successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating country status." });
  }
};

export const getVairifyNowSearch = async (req, res) => {
  const { userId } = req.params;
  const { inquiry } = req.query;

  try {
    const query = { userId };
    if (inquiry) {
      query.inquiry = inquiry;
    }
    const userDetails = await VairifyNow.find(query)
      .sort("-_id")
      .populate(
        "userId",
        "affiliate_url business_name business_type bussiness_vai country email name gender profilePic user_type vaiID"
      );

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching user details" });
  }
};

export const getVairifyNowSearchResult = async (req, res) => {
  // const { id } = req.params;
  // const { status } = req.query;

  try {
    const userDetails = req.body;
    if (!userDetails) {
      return res.status(404).json({ message: "Result not found" });
    }
    const data = await matchProfileData(userDetails);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const matchProfileData = async (userDetails) => {
  try {
    const {
      userId,
      location,
      gender,
      orientation,
      sharedLocation,
      venue,
      isAvailable,
      build,
      height,
      eyescolor,
      haircolor,
      hairlength,
      weight,
      piercings,
      publichair,
      breastappearance,
      breasttype,
      tattoos,
      typespecialty,
      catagory,
      advancedservices,
      trurevu
    } = userDetails;

    const profileDetailsQuery = [
      { venue: venue },
      { isAvailable: isAvailable },
      { location: location },
      { build: build },
      { height: height },
      { eyescolor: eyescolor },
      { haircolor: haircolor },
      { hairlength: hairlength },
      { weight: weight },
      { piercings: piercings },
      { publichair: publichair },
      { breastappearance: breastappearance },
      { breasttype: breasttype },
      { tattoos: tattoos },
      { typespecialty: typespecialty },
    ].filter(item => Object.values(item)[0])

    const query = {
      userId: { $ne: userId },
    };
    if (profileDetailsQuery?.length) {
      query['$and'] = profileDetailsQuery
    }
    if (orientation) {
      query.orientation = orientation
    }
    if (gender) {
      query.gender = gender;
    }
    if (sharedLocation === "share" || sharedLocation === "acceptRequest") {
      query.sharedLocation = sharedLocation;
    }

    const servicesQuery = {
      "services.serviceType": { $in: [catagory] },
    };

    if (advancedservices?.length) {
      servicesQuery["services.services.servicesName"] = {
        $all: advancedservices,
      };
    }

    const profiles = await profileDetails.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "services",
          localField: "userId",
          foreignField: "userId",
          as: "services",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
          pipeline: [{
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "reviewee",
              as: "reviews",
            }
          }]
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $unwind: "$services",
      },
      {
        $match: servicesQuery,
      },
    ]);

    const result = profiles.map((profile, index) => {
      let data = { profile };
      data.services = data.profile.services;
      delete data.profile.services;
      return data;
    });

    if (result.length > 0) {
      return { result, message: `${result.length} result fount` };
    }
    {
      return { result, message: "Result not found" };
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Invitation = async (req, res) => {
  const userDetails = req.body;
  try {
    const data = await matchProfileData(userDetails);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const DeleteVairifyNow = async (req, res) => {
  const { id } = req.params;
  try {
    const userDetails = await VairifyNow.findByIdAndDelete(id);
    if (!userDetails) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.status(200).json({ message: "Delete successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const saveVairifyNowAppointment = async (req, res) => {
  try {
    var data = req.body
    const { type, clientId, companionId, clientStatus, companionStatus, service } = data
    if (!type || !clientId || !companionId || !clientStatus || !companionStatus || !service) {
      return res.status(400).json({ error: "Invalid Request!" })
    }
    data.startDateTime = null;
    data.endDateTime = null;

    const [file] = req.files || []

    if (file) {
      data.manualSelfie = {
        file: file.filename,
        path: file.path
      }
    }

    const appointment = new Appointment(data)
    await appointment.save()
    return res.status(200).json(appointment)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export const getVairifyNowAppointments = async (req, res) => {
  const { userId } = req.params
  const all = req?.query?.all

  const user = await User.findById(userId)

  if (!user) {
    return res.status(400).send({ error: "User not found" })
  }

  const { user_type } = user
  var filter = {}
  if (user_type === 'client-hobbyist') {
    filter = { clientId: new mongoose.Types.ObjectId(userId), $or: [{ clientStatus: 'Requested' }, { clientStatus: 'Cancel' }, { clientStatus: 'Sign Pending' }, { clientStatus: 'Signedrs' }] }
  }

  if (user_type === 'agency-business' || user_type === 'companion-provider') {
    filter = { companionId: new mongoose.Types.ObjectId(userId), $or: [{ companionStatus: 'Pending' }, { companionStatus: 'Signed' }] }
  }

  if (Object.keys(filter).length <= 0) {
    return res.status(400).send({ error: 'Invalid user role' })
  }

  filter = {
    ...filter,
    type: { $ne: 'varify-now' },
  }

  if (all !== 'true') {
    filter.startDateTime = { $gte: null }
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
  ])

  return res.send(appointments)
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

    return res.send(response)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}

export const getVairifyNowAppointment = async (req, res) => {
  const { appointmentId } = req.params

  const appointment = await Appointment.findById(appointmentId).populate('clientId').populate('companionId')

  if (!appointment) {
    return res.status(404).send({ error: "Appointment not found" })
  }

  return res.send(appointment)
}

export const updateVairifyNowAppointment = async (req, res) => {
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

  const [file] = req.files || []

  var data = req.body
  if (file) {
    data = JSON.parse(req.body.data)
    data.manualSelfieCompanion = {
      file: file.filename,
      path: file.path
    }
  }

  const response = await Appointment.updateOne({ _id: appointmentId }, {
    $set: data
  })

  return res.send(response)
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


const matchProfileDataVaiNow = async (userDetails) => {
  try {
    const {
      userId,
      location,
      gender,
      orientation,
      sharedLocation,
      venue,
      isAvailable,
      build,
      height,
      eyescolor,
      haircolor,
      hairlength,
      weight,
      piercings,
      publichair,
      breastappearance,
      breasttype,
      tattoos,
      typespecialty,
      category,
      advancedservices,
      trurevu
    } = userDetails;

    const profileDetailsQuery = [
      // { isAvailable: isAvailable },
      // { location: location },
      { build: build },
      { height: height },
      { eyescolor: eyescolor },
      { haircolor: haircolor },
      { hairlength: hairlength },
      { weight: weight },
      { piercings: piercings },
      { publichair: publichair },
      { breastappearance: breastappearance },
      { breasttype: breasttype },
      { tattoos: tattoos },
      { typespecialty: typespecialty },
    ].filter(item => Object.values(item)[0])

    const query = {
      userId: { $ne: new mongoose.Types.ObjectId(userId) },
    };
    if (profileDetailsQuery?.length) {
      query['$and'] = profileDetailsQuery
    }
    if (orientation) {
      query.orientation = orientation
    }
    if (gender) {
      query.gender = gender;
    }
    if (sharedLocation === "share" || sharedLocation === "acceptRequest") {
      query.sharedLocation = sharedLocation;
    }

    const servicesQuery = {
      "services.serviceType": { $in: [category] },
      "userId.vaiNowAvailable.venue": venue
    };

    if (advancedservices?.length) {
      servicesQuery["services.services.servicesName"] = {
        $all: advancedservices,
      };

    }

    const profiles = await profileDetails.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "services",
          localField: "userId",
          foreignField: "userId",
          as: "services",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
          pipeline: [{
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "reviewee",
              as: "reviews",
            }
          }]
        },
      },
      {
        $unwind: "$userId",
      },
      {
        $unwind: "$services",
      },
      {
        $match: servicesQuery,
      },
    ]);

    const result = profiles.map((profile, index) => {
      let data = { profile };
      data.services = data.profile.services;
      delete data.profile.services;
      return data;
    }).filter(profile => {
      const { availableFrom, duration } = profile?.profile?.userId?.vaiNowAvailable || {}
      if (availableFrom && duration) {
        return moment().isBefore(moment(availableFrom).add(duration, 'minutes')) || moment().isAfter(moment(availableFrom).add(duration, 'minutes'))
      } else {
        return false
      }
    });

    if (result.length > 0) {
      return { result, message: `${result.length} result found` };
    }
    {
      return { result, message: "Result not found" };
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const InvitationV2 = async (req, res) => {
  const userDetails = req.body;
  try {
    const data = await matchProfileDataVaiNow(userDetails);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const requestLocation = async (req, res) => {
  const { userId, profileId } = req.params || {}
  try {
    const profiles = (await Users.find({ _id: { $in: [userId, profileId] } })) || []

    const user = profiles.find(item => item?._id?.toString() == userId)
    const profile = profiles.find(item => item?._id?.toString() == profileId)

    if (!user || !profile) {
      return res.status(404).send({ error: 'Profile not found' })
    }

    const existingLocationRequests = (profile?.locationRequests || []).filter(loc => !loc.isRejected).find(loc => loc?.userId?.toString() === userId)

    if (existingLocationRequests) {
      return res.status(400).send({ error: 'You have already requested location for this profile.' })
    }

    let requests = profile.locationRequests || []

    let payload = {
      userId: userId,
      requestedAt: new Date,
      isApproved: false,
      approvedAt: null,
      isRejected: false,
      rejectedAt: null
    }
    requests.push(payload)

    const updateResponse = await Users?.updateOne({ _id: profileId }, { $set: { locationRequests: requests } })
    sendNotification(userId, profileId, 'LOCATION_REQUEST', `New Location Request`, `${user.name} has requested your location for vairify now`, {})
    res.status(200).json(updateResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveRejectLocation = async (req, res) => {
  const { notificationId } = req.params || {}
  const { type } = req.body || {}
  try {
    const user = (await Users.findOne({ "locationRequests._id": notificationId })).toJSON()

    if (!user) {
      return res.status(404).send({ error: 'Profile not found' })
    }

    let requests = (user.locationRequests || []).map(request => {
      if (request?._id.toString() == notificationId) {
        return {
          ...request,
          [type === 'approve' ? 'isApproved' : 'isRejected']: true,
          [type === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date
        }
      }
      return request
    })

    let request = requests?.find(item => item?._id?.toString() == notificationId)
    const updateResponse = await Users?.updateOne({ _id: user?._id }, { $set: { locationRequests: requests } })
    sendNotification(user?._id, request?.userId?.toString(), 'LOCATION_REQUEST', `Location Request ${type == 'approve' ? 'Approved' : 'Rejected'}`, `${user.name} has ${type == 'approve' ? 'approved' : 'rejected'} your location request for vairify now`, {})
    res.status(200).json(updateResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getLocationRequests = async (req, res) => {
  const { userId } = req.params || {}
  try {
    const user = (await Users.findOne({ "_id": userId }).populate('locationRequests.userId')).toJSON()

    if (!user) {
      return res.status(404).send({ error: 'Profile not found' })
    }

    res.status(200).json(user?.locationRequests.sort((a, b) => moment(b.requestedAt).diff(a.requestedAt)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
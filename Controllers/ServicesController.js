import mongoose from "mongoose";
import Services from "../Models/ServicesModal.js";
import User from "../Models/UserModal.js";

export const createServicesDetails = async (req, res) => {
  const {
    userId,
    services,
    hourlyRates,
    currency,
    businessday,
    businessHourlyRates,
    description,
    title,
    user_type,
    serviceType,
  } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const user = await User.findById(userId)

    if (!user?._id) {
      return res.status(400).json({ error: "User not found!" });
    }

    const updatedServices = await Services.findOneAndUpdate({ userId: user?._id }, {
      userId,
      services,
      hourlyRates,
      currency,
      businessday,
      businessHourlyRates,
      description,
      title,
      user_type,
      serviceType,
    }, { upsert: true, new: true })

    // Create a new Services document
    // const ServicesDetails = new Services({
    //   userId,
    //   services,
    //   hourlyRates,
    //   currency,
    //   businessday,
    //   businessHourlyRates,
    //   description,
    //   title,
    //   user_type,
    //   serviceType,
    // });

    // Save the document to the database
    // await ServicesDetails.save();

    res
      .status(200)
      .json({ message: "Services saved successfully", updatedServices });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};

export const getServicesDetails = async (req, res) => {
  const { userId } = req.params;
  const { usertype } = req.query;

  try {
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (usertype) {
      query.user_type = usertype;
    }
    const userDetails = await Services.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
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
        $unwind: "$userId",
      },
    ]);

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

export const updateService = async (req, res) => {
  const { id } = req.params;

  try {
    const MarketSearch = await Services.findByIdAndUpdate(id, req.body, {
      new: true,
    }).sort("-_id");
    if (!MarketSearch) {
      return res.status(404).json({ error: "Services not found." });
    }

    res.status(200).json({ MarketSearch, message: "Update successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating country status." });
  }
};

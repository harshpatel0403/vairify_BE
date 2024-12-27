import UserDetails from "../Models/UserDetailModal.js";

export const createUserDetails = async (req, res) => {
  const {
    userId,
    gender,
    orientation,
    country,
    city,
    ethnicity,
    nationality,
    smoker,
    build,
    height,
    eyeColor,
    hairLength,
    hairColor,
    weight,
    pubicHair,
    piercing,
    tattoo,
    travel,
    venue,
    virtualServices,
    communication,
    breastType,
    breastSize,
    breastAppearance,
    onlyFans,
    pornstar,
    penisSize,
    description
  } = req.body;

  try {
    const userDetails = new UserDetails({
      userId,
      gender,
      orientation,
      country,
      city,
      ethnicity,
      nationality,
      smoker,
      build,
      height,
      eyeColor,
      hairLength,
      hairColor,
      weight,
      pubicHair,
      piercing,
      tattoo,
      travel,
      venue,
      virtualServices,
      communication,
      breastType,
      breastSize,
      breastAppearance,
      onlyFans,
      pornstar,
      penisSize,
      description
    });

    await userDetails.save();

    res.status(201).json({ message: "User details created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};

export const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const userDetails = await UserDetails.findOne({ userId });

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

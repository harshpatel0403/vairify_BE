import shortid from "shortid";
import Coupon from "../Models/CouponModal.js";
import User from "../Models/UserModal.js";

export const getCouponsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const coupons = await Coupon.find({ userId });

    return res.json({
      coupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const applyCoupon = async (req, res) => {
  const { userId, couponCode } = req.body;

  try {
    // Check if the coupon exists
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    if (coupon.usedBy) {
      return res.status(400).json({ message: "Coupon already used." });
    }

    if (coupon.expirationDate < new Date()) {
      return res.status(400).json({ message: "Coupon has expired." });
    }

    // Apply the coupon to the user's model
    const user = await User.findById(userId); // Assuming you have a User model

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.couponUsed = couponCode; // Apply the coupon to the user

    coupon.usedBy = `${user.name} - ${user.vaiID}`; // Modify this based on your user schema
    await coupon.save();
    await user.save();

    return res.json({
      message: "Coupon successfully applied.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const generateCoupons = async (req, res) => {
  const { userId, numberOfCoupons } = req.body;

  try {
    const coupons = [];
    if(numberOfCoupons <= 0){
      return res.status(400).send("Invalid number of coupons")
    }

    for (let i = 0; i < numberOfCoupons; i++) {
      const couponCode = shortid.generate();

      coupons.push({ code: couponCode, usedBy: null, userId });
    }

    const result = await Coupon.insertMany(coupons);

    return res.json({
      message: `${numberOfCoupons} coupons generated successfully.`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

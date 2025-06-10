import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
};

const verify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { signInToken, verify };
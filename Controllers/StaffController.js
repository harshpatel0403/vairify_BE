import User from "../Models/UserModal.js";
import { sendMail } from "../Config/email.js";
import crypto from "crypto"; // Import the crypto library
import bcrypt from "bcryptjs";
import { uploadToS3 } from "../utils/awsS3Functions.js";

// Function to generate a secure temporary password
const generateTemporaryPassword = () => {
  const length = 10; // You can adjust the length as needed
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
};

function isValidEmail(email) {
  // Regular expression for a valid email address
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  return emailRegex.test(email);
}

export const createNewStaff = async (req, res) => {
  try {
    const file = req.files;
    const data = req.fields;
    var image = "";
    if (file) {
      const folderName = "usersProfile";
      await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
        .then(url => {
          console.log('File uploaded successfully in Staff controller:', url);
          image = url;
        })
        .catch(err => console.error('Error uploading file in Staff controller:', err));
    }

    const currentUser = await User.findById(data.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser.user_type != "agency-business") {
      return res
        .status(404)
        .json({ error: "You are not authorized to manage Business Staff" });
    }

    if (!data.name) {
      return res.status(404).json({ error: "Invalid name" })
    }

    if (!data.email || !isValidEmail(data.email)) {
      return res.status(404).json({ error: "Invalid Email" });
    } else {
      const checkEmail = await User.findOne({ email: data.email });
      if (checkEmail) {
        return res.status(400).json({ error: "This email is already in use." });
      }
    }

    // Generate a temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Encrypt the temporary password
    const encryptedPassword = await bcrypt.hash(temporaryPassword, 10);

    let user_type = "";
    if (data.userType == "admin") {
      user_type = "admin_staff";
    } else if (data.userType == "staff") {
      user_type = "service_staff";
    } else {
      return res.status(404).json({ error: "Invalid User Type" });
    }

    const user = new User({
      email: data.email,
      name: data.name,
      user_type,
      description: data.description,
      staff_parent: currentUser._id,
      password: encryptedPassword, // Store the encrypted password
    });

    user.profilePic = image;
    await user.save();
    const emailBody = {
      to: data.email, // Using the provided "verifyId" as the recipient
      subject: "Temporary Password for Vairify App Access",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
            <h2 style="color: #333; font-weight: bold; font-size: 20px; text-align: center;">Welcome to Vairify</h2>
            <div style="margin-bottom: 20px;"></div>
            <p style="font-size: 14px; text-align: left;">You have been added as a staff member by ${currentUser.name} on Vairify.</p>
            <div style="margin-bottom: 20px;"></div>
            <p style="font-size: 14px; text-align: left;">Please have a look at your credentials below:</p>
            <p style="font-size: 14px; text-align: left;">User ID: ${data.email}</p>
            <p style="font-size: 14px; text-align: left;">Temporary Password: ${temporaryPassword}</p>
            <div style="margin-bottom: 20px;"></div>
            <p style="font-size: 12px; text-align: left;">For security, change your password soon.</p>
            <p style="color: #555; font-size: 12px; text-align: left;">Do not share your temporary password with others.</p>
          </div>
        </div>
      `,
    };

    // Send an email with the temporary password using the sendMail function
    sendMail(
      emailBody,
      res,
      "Staff profile created successfully, and email sent with temporary password"
    );

    return res.json({
      message:
        "Staff profile created successfully, and email sent with temporary password.",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const assignPermissions = async (req, res) => {
  try {
    const { staffId, features, userId } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await User.findById(staffId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.tokensActivity = features.tokensActivity;
    user.dateGuardActivity = features.dateGuardActivity;
    user.marketPlaceActivity = features.marketPlaceActivity;
    user.calendarActivity = features.calendarActivity;
    user.varipayActivity = features.varipayActivity;
    user.inAppFacialVerificationActivity =
      features.inAppFacialVerificationActivity;
    user.advertisementActivity = features.advertisementActivity;
    user.callsActivity = features.callsActivity;
    user.messagesActivity = features.messagesActivity;
    user.socialPostActivity = features.socialPostActivity;

    await user.save(); // Save the updated user

    return res.json({
      message: `Permissions assigned successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listStaff = async (req, res) => {
  try {
    const { userId } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Unauthorized access" });
    }

    // Find and list admin and service staff separately
    const adminStaff = await User.find({
      user_type: "admin_staff",
      staff_parent: currentUser._id,
    });
    const serviceStaff = await User.find({
      user_type: "service_staff",
      staff_parent: currentUser._id,
    });

    res.json({ adminStaff, serviceStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getPermission = async (req, res) => {
  try {
    const { userId } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Unauthorized access" });
    }

    const { staffId } = req.params;

    const user = await User.findById(staffId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const permissions = {
      tokensActivity: user.tokensActivity,
      dateGuardActivity: user.dateGuardActivity,
      marketPlaceActivity: user.marketPlaceActivity,
      calendarActivity: user.calendarActivity,
      varipayActivity: user.varipayActivity,
      inAppFacialVerificationActivity: user.inAppFacialVerificationActivity,
      advertisementActivity: user.advertisementActivity,
      callsActivity: user.callsActivity,
      messagesActivity: user.messagesActivity,
      socialPostActivity: user.socialPostActivity,
    };

    return res.json({ permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

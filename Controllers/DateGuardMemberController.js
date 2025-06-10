import twilio from "twilio";
import shortid from "shortid";
import DateGuardGroup from "../Models/DateGuardGroupModal.js";
import User from "../Models/UserModal.js";
import DateGuardMember from "../Models/DateGuardMemberModal.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function sendSMS(username, phoneNumber, smsCode, token) {
  try {
    const message = await client.messages.create({
      body: `${username} has requested you to be one of her Guardians Please click on the link and enter the following ${process.env.REACT_SMS_CODE_URL}/dateguard/join-member-to-group/${token} Please Enter this code ${smsCode}`,
      from: `${process.env.TWILLIO_NUMBER}`,
      to: `${phoneNumber}`,
    });
    console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error);
  }
}

const createMember = async (req, res) => {
  try {
    const { name, phoneNumber, groupToken } = req.body;
    const { userId } = req?.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const member = await DateGuardMember.create({
      name,
      phoneNumber,
      userId,
      smsCode: generateRandomCode(),
      verificationToken: shortid.generate(),
    });

    res.status(201).json(member);
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create the member." });
  }
};

const getMembers = async (req, res) => {
  try {
    const { userId } = req?.params;
    const members = await DateGuardMember.find({ userId });
    res.status(201).json(members);
  } catch (error) {
    console.error("Error listing members:", error);
    res.status(500).json({ error: "Failed to list the members." });
  }
};

const addMemberToGroup = async (req, res) => {
  try {
    const { groupId, member } = req.body;
    const group = await DateGuardGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    group.members.push(member);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to add a member to the group." });
  }
};

const verifySmsCode = async (req, res) => {
  try {
    const { memberToken, smsCode } = req.body;

    const member = await DateGuardMember.findOne({
      verificationToken: memberToken,
    });

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (smsCode !== member.smsCode) {
      return res.status(400).json({ error: "Invalid SMS code" });
    }

    member.status = "joined";
    await member.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Failed to verify the code." });
  }
};

export { createMember, getMembers, addMemberToGroup, verifySmsCode };

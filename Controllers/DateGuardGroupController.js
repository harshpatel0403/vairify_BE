import twilio from "twilio";
import shortid from "shortid";
import DateGuardGroup from "../Models/DateGuardGroupModal.js";
import User from "../Models/UserModal.js";
import DateGuardAlarms from "../Models/DateGuardAlarmModal.js";
import DateGuardCodes from "../Models/DateGuardCodeModal.js";
import DateGuardMember from "../Models/DateGuardMemberModal.js";
import { uploadToS3 } from "../utils/awsS3Functions.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twillioNumber = process.env.TWILLIO_NUMBER;
const client = new twilio(accountSid, authToken);

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function sendSMS(phoneNumber, smsCode, username, token, groupToken, path) {
  try {
    const message = await client.messages.create({
      body: `${username} has requested you to be one of her Guardians Please click on the link and enter the following ${process.env.REACT_SMS_CODE_URL}/dateguard/join-member-to-group/${path ? `${path}/` : "/"}${token}/${groupToken} Please Enter this code ${smsCode}`,
      from: twillioNumber,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
    return Promise.resolve(message)
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error);
    // TODO: for development purpose only
    return Promise.resolve(error)
  }
}

async function sendSMSGeneral(phoneNumber, sms) {
  try {
    const message = await client.messages.create({
      body: sms,
      from: twillioNumber,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
    return Promise.resolve(message)
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error);
    // TODO: for development purpose only
    return Promise.resolve(error)
  }
}

const createGroup = async (req, res) => {
  try {
    const { groupName, members } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    members.forEach((member) => {
      member.smsCode = generateRandomCode();
      member.verificationToken = shortid.generate();
    });

    const group = new DateGuardGroup({
      name: groupName,
      userId: userId,
      members: members,
      groupToken: shortid.generate(),
    });

    await group.save();

    // Send SMS to each member
    members.forEach(async (member) => {
      await sendSMS(member.phoneNumber, member.smsCode, member.verificationToken, group.groupToken);
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create the group." });
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

const updateMemberStatus = async (req, res) => {
  try {
    const { groupId, memberId, newStatus } = req.body;
    const group = await DateGuardGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    const member = group.members.id(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found in the group." });
    }
    member.status = newStatus;
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to update member status." });
  }
};

const deleteMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const group = await DateGuardGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    group.members.id(memberId).remove();
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete member from the group." });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await DateGuardGroup.findByIdAndRemove(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    res.status(204).end(); // No content as the group is deleted
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the group." });
  }
};

const listGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const userGroups = await DateGuardGroup.find({ userId });
    res.status(200).json(userGroups);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user groups." });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await DateGuardGroup.findById(groupId).populate('members.memberId');

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve group details." });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, members } = req.body;

    const group = await DateGuardGroup.findById(groupId).populate('members');

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    members.forEach((member) => {
      if (member.status === "invited") {
        member.smsCode = generateRandomCode();
        member.verificationToken = generateVerificationToken();
      }
    });

    // Update the group's properties
    group.name = groupName;
    // group.members = members;

    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the group." });
  }
};

const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId } = req?.params;
    const { memberId } = req?.body;
    console.log(groupId, memberId, ' <=== gorup and memeber id')
    const group = await DateGuardGroup.updateOne({ _id: groupId }, {
      $pull: {
        members: {
          memberId
        }
      }
    })

    res.status(200).json(group)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to remove member from group." })
  }
}

const inviteMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req?.params;
    const { memberId } = req?.body;

    const member = await DateGuardMember.findById(memberId).populate('userId');

    let smsCode = generateRandomCode()

    if (!member?._id) {
      return res.status(400).json({ error: "Failed to Invite member to group." })
    }

    await sendSMS(member.phoneNumber, smsCode, member?.userId?.name, member._id?.toString(), groupId, '');

    console.log(`Please click on the link and enter the following ${process.env.REACT_SMS_CODE_URL}/dateguard/join-member-to-group/${member._id}/${groupId} Please Enter this code ${smsCode}`) // for development purpose only

    const group = await DateGuardGroup.findByIdAndUpdate(groupId, {
      $push: {
        members: {
          memberId,
          status: "Invited",
          smsCode
        }
      }
    })

    res.status(200).json(group)

  } catch (error) {
    res.status(500).json({ error: "Failed to Invite member to group." })
  }
}

const getUniqueMembersForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userGroups = await DateGuardGroup.find({ userId });

    const uniqueMembersMap = new Map();

    userGroups?.forEach((group) => {
      group.members?.forEach((member) => {
        if (member.phoneNumber) {
          const phoneNumber = member.phoneNumber;
          if (!uniqueMembersMap.has(phoneNumber)) {
            uniqueMembersMap.set(phoneNumber, {
              name: member.name,
              phoneNumber: member.phoneNumber,
              status: member.status,
            });
          }
        }
      });
    });

    const uniqueMembersArray = Array.from(uniqueMembersMap.values());

    res.status(200).json(uniqueMembersArray);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to retrieve unique members." });
  }
};

const verifySmsCode = async (req, res) => {
  try {
    const { groupToken, memberToken, smsCode } = req.body;

    const group = await DateGuardGroup.findById(groupToken);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const member = group.members.find((m) => m.memberId.toString() === memberToken);

    if (!member) {
      return res.status(404).json({ error: 'Member not found in the group' });
    }

    if (smsCode !== member.smsCode) {
      return res.status(400).json({ error: 'Invalid SMS code' });
    }

    member.status = 'joined';

    await group.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify the code.' });
  }
};

const setAlarm = async (req, res) => {
  try {
    const { groupId, appointmentId, hours, minutes, seconds, meridiem, alarmDelay } = req.body
    console.log(groupId, ' <======')
    const group = await DateGuardGroup.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // TODO: add validation for appointment exists here

    const existingAlarm = await DateGuardAlarms.findOne({ groupId, appointmentId })
    if (existingAlarm) {
      existingAlarm.hours = hours
      existingAlarm.minutes = minutes
      existingAlarm.seconds = seconds
      existingAlarm.meridiem = meridiem
      existingAlarm.alarmDelay = alarmDelay

      await existingAlarm.save()
    } else {
      await DateGuardAlarms.create({
        groupId,
        appointmentId,
        hours,
        minutes,
        seconds,
        meridiem,
        alarmDelay
      })
    }

    return res.send({ message: 'Alarm saved' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Internal server error' })
  }
}

const getAlarm = async (req, res) => {
  try {
    const { groupId, appointmentId, alarmId } = req.query
    // const group = await DateGuardGroup.findOne({ _id: groupId });

    // if (!group) {
    //   return res.status(404).json({ error: 'Group not found' });
    // }

    // TODO: add validation for appointment exists here
    let findQuery = {
      groupId, appointmentId
    }
    if (alarmId) {
      findQuery = {
        _id: alarmId
      }
    }
    const alarm = await DateGuardAlarms.findOne(findQuery)

    if (!alarm) {
      return res.status(404).send({ error: "Alarm not found" })
    }

    return res.send(alarm)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Internal server error' })
  }
}


const uploadProof = async (req, res) => {
  try {
    const data = req.fields;
    const file = req.files;

    if (!file) {
      return res.status(400).send({ error: "Please upload proof" })
    }

    const group = await DateGuardGroup.findOne({ _id: data.groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // TODO: add validation for appointment exists here

    const existingAlarm = await DateGuardAlarms.findOne({ groupId: data.groupId, appointmentId: data.appointmentId })
    if (!existingAlarm) {
      return res.status(400).send({ error: 'No alarms set for this appointment' })
    }
    var imageURL;
    if (file) {

      const folderName = 'dateguard';
      await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimetype)
        .then(url => {
          console.log('File uploaded successfully in DateGuard:', url);
          imageURL = url;
        })
        .catch(err => console.error('Error uploading file in Dateguard:', err));
    }

    existingAlarm.proof = {
      message: data.message,
      file: imageURL,
      path: imageURL
    }

    await existingAlarm.save()

    return res.send({ message: 'Alarm saved' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Internal server error' })
  }
}

const noteTimerStarted = async (req, res) => {
  try {
    const { groupId, appointmentId, timerStartTime } = req.body
    console.log(groupId, ' <======')
    const group = await DateGuardGroup.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // TODO: add validation for appointment exists here

    const existingAlarm = await DateGuardAlarms.findOne({ groupId, appointmentId })
    if (!existingAlarm) {
      return res.status(404).send({ error: 'No Alarms configured for this appointment' })
    }

    existingAlarm.timerStartTime = timerStartTime
    await existingAlarm.save()

    return res.send({ message: 'Alarm saved' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Internal server error' })
  }
}

const activateAlarm = async (req, res) => {
  try {
    const { groupId, appointmentId, userId, codeInput, direct, location, pauseMode } = req.body
    console.log(groupId, ' <======')
    const group = await DateGuardGroup.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const code = await DateGuardCodes.findOne({ userId })

    if (!code) {
      return res.status(400).send({ error: 'Codes are not configured' })
    }

    // TODO: add validation for appointment exists here

    const existingAlarm = await DateGuardAlarms.findOne({ groupId, appointmentId })
    if (!existingAlarm) {
      return res.status(404).send({ error: 'No Alarms configured for this appointment' })
    }

    let field = ''
    let isDecoyed = false
    if (code.disarm == codeInput && !direct) {
      field = 'alarmDisarmed'
    } else if (code.decoy == codeInput || direct) {
      field = 'alarmDecoyed'
      isDecoyed = true
    } else {
      return res.status(400).send({ error: "Code did not match" })
    }

    if (pauseMode && !isDecoyed) {
      return res.send({ error: 'Code is correct' })
    }

    // TODO: ADD LOGIC HERE TO ACTIVATE DECOY IF DECOY CODE ADDED
    if (isDecoyed) {
      let promises = []
      let memberIds = []
      const user = await User.findOne({ _id: userId })
      group.members.forEach((member) => {
        if (member.status === 'joined') {
          memberIds.push(member.memberId.toString())
        }
      })
      const members = await DateGuardMember.find({ _id: { $in: memberIds } })
      for (let member of members) {
        console.log(`Your family member/friend ${user.name || ''} is in danger, he/she decoyed an danger alarm to get more info visit below link ${process.env.REACT_SMS_CODE_URL}/dateguard/emergency-contacts/${existingAlarm._id.toString()}/${member._id.toString()}`)
        promises.push(sendSMSGeneral(member.phoneNumber, `Your family member/friend ${user.name || ''} is in danger, he/she decoyed an danger alarm to get more info visit below link ${process.env.REACT_SMS_CODE_URL}/dateguard/emergency-contacts/${existingAlarm._id.toString()}/${member._id.toString()}`))
      }

      await Promise.all(promises)
    }

    existingAlarm[field] = new Date
    existingAlarm.location = location || {}
    await existingAlarm.save()

    return res.send({ message: 'Alarm saved' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Internal server error' })
  }
}

export {
  createGroup,
  addMemberToGroup,
  inviteMemberToGroup,
  removeMemberFromGroup,
  updateMemberStatus,
  deleteMemberFromGroup,
  deleteGroup,
  listGroups,
  getGroupDetails,
  updateGroup,
  getUniqueMembersForUser,
  verifySmsCode,
  setAlarm,
  getAlarm,
  uploadProof,
  noteTimerStarted,
  activateAlarm
};

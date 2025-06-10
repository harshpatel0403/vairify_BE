import calendarSchedule from "../Models/CalendarSchedulesModal.js";
import CalendarSetting from "../Models/CalendarSettingModal.js";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import Appointment from '../Models/AppointmentModal.js'
import mongoose from "mongoose";
import axios from "axios";



//  google auth
const oAuth2Client = new OAuth2Client(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.GAUTH_CALLBACK
);
//  google auth end

// for outlook
const config = {
  auth: {
    clientId: process.env.AZURE_APP_ID,
    authority: `https://login.microsoftonline.com/common`,
    clientSecret: process.env.AZURE_SECRET,
    response_type: 'token',
    redirectUri: 'http://localhost:5001/api/v1/calendar/microsoft-auth-callback', // Add this callback URL in Azure AD app
  },
};

const cca = new msal.ConfidentialClientApplication(config);
// outlook config end


export const createCalendarDetail = async (req, res) => {
  const data = req.body;
  try {
    if (!data.userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    // Find all calendar records with the same userId
    const filter = { userId: data.userId };

    // Update the status for all matching records
    const update = { status: "in-active" };

    const result = await calendarSchedule.updateMany(filter, update);

    // Create a new Calendar document
    const CalendarDetails = new calendarSchedule(data);

    await CalendarDetails.save();

    res.status(200).json({
      message: "Calendar services created successfully",
      CalendarDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};

export const getCalendarDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = { userId: userId };

    const CalendarDetails = await calendarSchedule.find(query).sort("-_id");

    if (!CalendarDetails) {
      return res.status(404).json({ error: "Calendar details not found" });
    }
    const existingSettings = await CalendarSetting.findOne(query);
    res
      .status(200)
      .json({ schedule: CalendarDetails, settings: existingSettings });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching user details" });
  }
};

export const updateCalendarService = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSchedule = req.body;
    const schedule = await calendarSchedule.findByIdAndUpdate(
      id,
      updatedSchedule,
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: "Calendar schedule not found." });
    }

    if (updatedSchedule.status === "active") {
      // If the updated status is 'active', find and update other records with the same userId
      await calendarSchedule.updateMany(
        { userId: schedule.userId, _id: { $ne: schedule._id } },
        { $set: { status: "in-active" } }
      );
    }

    res
      .status(200)
      .json({ schedule, message: "Calendar schedule updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating calendar status." });
  }
};

export const deleteCalendarService = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await calendarSchedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found." });
    }

    res.status(200).json({ message: "Schedule delete successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating country status." });
  }
};

export const updateCalendarSettings = async (req, res) => {
  const data = req.body;
  console.log("🚀 ~ file: CalendarScheduleController.js:106 ~ updateCalendarSettings ~ data:", data)
  const userId = data.userId;

  try {
    // Check if a profile with the same userId exists
    const existingSettings = await CalendarSetting.findOne({ userId });

    if (existingSettings) {
      // Profile with the same userId exists, update it
      await CalendarSetting.findOneAndUpdate({ userId }, data);

      res.status(200).json({ message: "Setting updated successfully" });
    } else {
      // Profile with the same userId does not exist, create a new one
      const newSettings = new CalendarSetting(data);

      await newSettings.save();

      res.status(200).json({
        message: "Setting created successfully",
        ProfileDetail: newSettings,
      });
    }
  } catch (error) {
    console.log("🚀 ~ file: CalendarScheduleController.js:129 ~ updateCalendarSettings ~ error:", error)
    res
      .status(500)
      .json({ error: "An error occurred while creating user details" });
  }
};

export const getCalendarSettings = async (req, res) => {
  const data = req.params;
  console.log("🚀 ~ file: CalendarScheduleController.js:139 ~ getCalendarSettings ~ data:", data)
  const userId = data.userId;

  try {
    // Check if a profile with the same userId exists
    const existingSettings = await CalendarSetting.findOne({ userId });

    res.status(200).json(existingSettings);
  } catch (error) {
    console.log("🚀 ~ file: CalendarScheduleController.js:148 ~ getCalendarSettings ~ error:", error)
    res
      .status(500)
      .json({ error: "An error occurred while getting calendar settings" });
  }
};

export const syncGoogleEvents = async (req, res) => {
  const userId = req.user._id;
  try {
    const postStateData = { userId: userId, userType: req.body.userType }
    if (req.body.isSingleEvent) {
      postStateData.eventId = req.body.eventId
    }
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: JSON.stringify(postStateData)
    });

    res.json({ authorizationUrl: authUrl });
  } catch (error) {
    console.log("🚀 ~ file: CalendarScheduleController.js:201 ~ sync google calnder ~ error:", error)
    res
      .status(500)
      .json({ error: "An error occurred while sync with google calendar" });
  }
};

export const googleAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  try {
    const stateData = JSON.parse(state || {})
    const { tokens } = await oAuth2Client.getToken(code);
    if (stateData && stateData.eventId) {
      await CreateSingleEventToGoogleCal(tokens.access_token, stateData)
    } else {
      await CreateGoogleCalenddarEvent(tokens.access_token, stateData?.userId, stateData?.userType)
    }
    res.send('Authorization successful. You can close this window.');
  } catch (error) {
    console.log("🚀 ~ file: CalendarScheduleController.js:213 ~ sync google calnder ~ error:", error)
    res
      .status(500)
      .json({ error: "An error occurred while sync with google calendar" });
  }
}

const CreateGoogleCalenddarEvent = async (token, userId, userType) => {
  const appointments = await findUpcommingAppointsByUser(userId, 1, userType, "companionGCalSyncId", "ClientGCalSyncId")
  if (!appointments || !appointments.length) {
    return { msg: 'no upcoming appointments found' }
  }

  const oAuth2ClientTest = new google.auth.OAuth2();
  oAuth2ClientTest.setCredentials({ access_token: token });
  const calendar = google.calendar({ version: 'v3', auth: oAuth2ClientTest });

  for (let index = 0; index < appointments.length; index++) {
    const element = appointments[index];
    const event = {
      summary: element.service.servicesName || 'Appointment',
      start: {
        dateTime: element.startDateTime,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: element.endDateTime,
        timeZone: 'Asia/Kolkata',
      },
    };
    try {
      const createEventRes = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      if (createEventRes) {
        const updateData = {

        }
        if (userType === 'companion-provider') {
          updateData.companionGCalSyncId = createEventRes.data?.id
        } else {
          updateData.ClientGCalSyncId = createEventRes.data?.id
        }

        await Appointment.updateOne({ _id: element._id }, {
          $set: updateData
        })
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }
  return true
}

const CreateSingleEventToGoogleCal = async (token, stateData) => {
  try {
    const appointment = await Appointment.findById(stateData.eventId)
    if (appointment && appointment.clientStatus == 'Scheduled' && appointment.companionStatus == 'Scheduled') {
      const event = {
        summary: appointment.service.servicesName || 'Appointment',
        start: {
          dateTime: appointment.startDateTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: appointment.endDateTime,
          timeZone: 'Asia/Kolkata',
        },
      };
      if (stateData.userType == 'companion-provider') {
        if (!appointment.companionGCalSyncId) {
          const eventRes = await createNewGoogleCalEvent(token, event, stateData.userType, appointment._id)
          return eventRes
        } else {
          const updateEventRes = await updateSingleGoogleEvent(token, event, stateData, appointment)
          return updateEventRes
        }
      } else {
        if (!appointment.ClientGCalSyncId) {
          const eventRes = await createNewGoogleCalEvent(token, event, stateData.userType, appointment._id)
          return eventRes
        } else {
          const updateEventRes = await updateSingleGoogleEvent(token, event, stateData, appointment)
          return updateEventRes
        }
      }
    }
    return appointment
  } catch (error) {

  }
}


const createNewGoogleCalEvent = async (token, eventData, userType, appointmentId) => {
  try {
    const oAuth2ClientTest = new google.auth.OAuth2();
    oAuth2ClientTest.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2ClientTest });
    const createEventRes = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventData,
    });
    let updateData = {}
    if (createEventRes) {
      if (userType === 'companion-provider') {
        updateData.companionGCalSyncId = createEventRes.data?.id
      } else {
        updateData.ClientGCalSyncId = createEventRes.data?.id
      }

      const apointmentRes = await Appointment.updateOne({ _id: appointmentId }, {
        $set: updateData
      })
    }
  } catch (error) {
    console.log(error)
    console.log('Error at create google cal event'.error)
    return error
  }
}

const updateSingleGoogleEvent = async (token, eventData, stateData, appointment) => {
  try {
    const oAuth2ClientTest = new google.auth.OAuth2();
    oAuth2ClientTest.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2ClientTest });
    let eventId = ''
    if (stateData.userType == 'companion-provider') {
      eventId = appointment.companionGCalSyncId
    } else {
      eventId = appointment.ClientGCalSyncId
    }
    const result = await calendar.events.update({
      calendarId: 'primary', // Use 'primary' for the user's primary calendar
      eventId: eventId,
      resource: eventData,
    });
    return result
  } catch (error) {

  }
}

const findUpcommingAppointsByUser = async (userId, type, userType, companionKey, clientKey) => {
  try {
    const currentDate = new Date();
    const filters = {
      clientStatus: 'Scheduled',
      companionStatus: 'Scheduled',
      startDateTime: { $gte: currentDate },

    }
    if (userType === 'companion-provider') {
      filters.companionId = new mongoose.Types.ObjectId(userId)
      if (type == 1) {
        filters[companionKey] = { $eq: null }
      }
    } else {
      filters.clientId = new mongoose.Types.ObjectId(userId)
      if (type == 1) {
        filters[clientKey] = { $eq: null }
      }
    }

    const appointments = await Appointment.aggregate([
      {
        $match: filters
      },
      {
        $sort: { startDateTime: 1 }
      },
    ])

    return appointments
  } catch (error) {
    console.log(error)
    return error
  }
}

export const syncMicrosoftEvents = async (req, res) => {
  const data = req.body;
  const userId = req.user._id;
  ;
  const postStateData = { userId: userId, userType: req.body.userType }
  if (req.body.isSingleEvent) {
    postStateData.eventId = req.body.eventId
  }

  try {

    const authCodeUrlParameters = {
      scopes: ['User.ReadWrite', 'Calendars.ReadWrite'],
      redirectUri: config.auth.redirectUri,
      state: JSON.stringify(postStateData)
    };


    const authUrlRedirect = await cca.getAuthCodeUrl(authCodeUrlParameters)

    res.json({ authorizationUrl: authUrlRedirect });
  } catch (error) {
    console.log("🚀 ~ file: CalendarScheduleController.js:148 ~ getCalendarSettings ~ error:", error)
    res
      .status(500)
      .json({ error: "An error occurred while getting calendar settings" });
  }
};

export const microsoftAuthCallback = async (req, res) => {
  try {

    const stateData = JSON.parse(req?.query?.state || {})

    const tokenResponse = await cca.acquireTokenByCode({
      code: req.query.code,
      scopes: ['https://graph.microsoft.com/.default'],
      redirectUri: config.auth.redirectUri,
    });

    let eventCreateRes;
    if (stateData && stateData.eventId) {
      eventCreateRes = await createMicrosoftCalendarEvent(tokenResponse.accessToken, stateData)
    } else {
      eventCreateRes = await CreateOutlookCalenddarEvent(tokenResponse.accessToken, stateData?.userId, stateData?.userType)
    }
    return res.send('Authorization successful. You can close this window.');
    // return res.json({ data: eventCreateRes })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const createMicrosoftCalendarEvent = async (token, stateData) => {
  try {

    const appointment = await Appointment.findById(stateData.eventId)
    if (appointment && appointment.clientStatus == 'Scheduled' && appointment.companionStatus == 'Scheduled') {

      const event = {
        subject: appointment.service.servicesName || 'Appointment',
        start: {
          dateTime: appointment.startDateTime,
          timeZone: 'Asia/Kolkata', // or 'IST'
        },
        end: {
          dateTime: appointment.endDateTime,
          timeZone: 'Asia/Kolkata',
        },
      }
      if (stateData.userType == 'companion-provider') {
        if (!appointment.companionOCalSyncId) {
          const eventRes = await createNewOutlookCalEvent(token, event, stateData.userType, appointment._id)
          return eventRes
        } else {
          const updateEventRes = await updateSingleOutlookEvent(token, event, stateData, appointment)
          return updateEventRes
        }
      } else {
        if (!appointment.ClientOCalSyncId) {
          const eventRes = await createNewOutlookCalEvent(token, event, stateData.userType, appointment._id)
          return eventRes
        } else {
          const updateEventRes = await updateSingleOutlookEvent(token, event, stateData, appointment)
          return updateEventRes
        }
      }
    }
  } catch (error) {
    console.error(error);
    return error
  }
}

const createNewOutlookCalEvent = async (token, eventData, userType, appointmentId) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
    const result = await client.api('/me/events/').post(eventData, async (err, resultRes) => {
      let updateData = {}
      if (resultRes?.id) {
        if (userType === 'companion-provider') {
          updateData.companionOCalSyncId = resultRes?.id
        } else {
          updateData.ClientOCalSyncId = resultRes?.id
        }

        const apointmentRes = await Appointment.updateOne({ _id: appointmentId }, {
          $set: updateData
        })
      }

      return resultRes
    })
    return result
  } catch (error) {
    console.log(error)
    console.log('Error at create google cal event'.error)
    return error
  }
}

const updateSingleOutlookEvent = async (token, eventData, stateData, appointment) => {
  try {
    let eventId = ''
    if (stateData.userType == 'companion-provider') {
      eventId = appointment.companionOCalSyncId
    } else {
      eventId = appointment.ClientOCalSyncId
    }
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
    const result = await client.api(`/me/events/${eventId}`).update(eventData, async (err, resultRes) => {
      let updateData = {}
      if (resultRes?.id) {
        if (stateData.userType === 'companion-provider') {
          updateData.companionOCalSyncId = resultRes.data?.id
        } else {
          updateData.ClientOCalSyncId = resultRes.data?.id
        }

        const apointmentRes = await Appointment.updateOne({ _id: appointment?._id }, {
          $set: updateData
        })
      }

      return resultRes
    })
    return result
  } catch (error) {

  }
}

const CreateOutlookCalenddarEvent = async (token, userId, userType) => {

  const appointments = await findUpcommingAppointsByUser(userId, 1, userType, "companionOCalSyncId", "ClientOCalSyncId")
  if (!appointments || !appointments.length) {
    return { msg: 'no upcoming appointments found' }
  }

  for (let index = 0; index < appointments.length; index++) {
    const element = appointments[index];
    const event = {
      subject: element.service.servicesName || 'Appointment',
      start: {
        dateTime: element.startDateTime,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: element.endDateTime,
        timeZone: 'Asia/Kolkata',
      },
    };
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, token);
        },
      });
      const result = await client.api(`/me/events`).post(event, async (err, resultRes) => {
        if (resultRes?.id) {
          const updateData = {

          }
          if (userType === 'companion-provider') {
            updateData.companionOCalSyncId = resultRes?.id
          } else {
            updateData.ClientOCalSyncId = resultRes?.id
          }

          await Appointment.updateOne({ _id: element._id }, {
            $set: updateData
          })
        }

        return resultRes
      })
      return result
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }
  return true
}
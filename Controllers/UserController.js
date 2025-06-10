import bcrypt from "bcryptjs";
import User from "../Models/UserModal.js";
import Profile from "../Models/ProfileModal.js";
import { ComplyCube } from "@complycube/api";
import Reviews from "../Models/ReviewModal.js";
import Coupon from "../Models/CouponModal.js";
import { signInToken } from "../Config/auth.js";
import shortid from "shortid";
import fs from "fs";
import { EmailClient } from "@azure/communication-email";
import twilio from "twilio";

import nodemailer from "nodemailer";
import moment from "moment";
import { userKycProfileDir, userProfileDir } from "../Routes/UserRoutes.js";
import profileDetails from "../Models/ProfileModal.js";
import calendarSchedule from "../Models/CalendarSchedulesModal.js";
import CalendarSetting from "../Models/CalendarSettingModal.js";
import Follower from "../Models/FollowerModal.js";
import Favourite from "../Models/FavouriteModal.js";
import mongoose from "mongoose";
import KYCDetails from "../Models/KYCDetailModal.js";
import { compareFaces, detectFace, uploadToS3 } from "../utils/awsS3Functions.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twillioNumber = process.env.TWILLIO_NUMBER;
const client = new twilio(accountSid, authToken);
const emailClient = new EmailClient(process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING);

const generateRandomCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

async function sendSMS(phoneNumber, smsCode) {
	try {
		const message = await client.messages.create({
			body: `Please Verify your phone number,  the code is ${smsCode}`,
			from: twillioNumber,
			to: phoneNumber,
		});
		console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
		return Promise.resolve(message);
	} catch (error) {
		console.error(`Error sending SMS to ${phoneNumber}:`, error);
		// TODO: for development purpose only
		return Promise.resolve(error);
	}
}

async function sendForgotSMS(phoneNumber, smsCode) {
	try {
		const message = await client.messages.create({
			body: `To Reset your password Please use this code ${smsCode}`,
			from: twillioNumber,
			to: phoneNumber,
		});
		console.log(`SMS sent to ${phoneNumber}: ${message.sid}`);
		return Promise.resolve(message);
	} catch (error) {
		console.error(`Error sending SMS to ${phoneNumber}:`, error);
		// TODO: for development purpose only
		return Promise.resolve(error);
	}
}

const createUser = async (req, res) => {
	try {
		let encryptedPassword;
		encryptedPassword = await bcrypt.hash(req.body.password, 10);

		const {
			name,
			language,
			parentId,
			phonenumber,
			email,
			password,
			country,
			user_type,
			business_name,
			business_type,
			gender,
			application_type,
			affiliate_url,
			user_affiliate_link,
			is_affiliate,
			is_admin,
			is_superadmin,
			phone,
			whatsapp,
			address,
			istest,
		} = req.body;
		console.log({
			name,
			language,
			parentId,
			phonenumber,
			email,
			password,
			country,
			user_type,
			business_name,
			business_type,
			gender,
			application_type,
			affiliate_url,
			user_affiliate_link,
			is_affiliate,
			is_admin,
			is_superadmin,
			phone,
			whatsapp,
			address,
			istest,
		});
		if (email) {
			const checkEmail = await User.findOne({ email: email });
			if (checkEmail) {
				return res
					.status(500)
					.json({ data: "This email is already in use." });
			}
		}

		const complycube = new ComplyCube({
			apiKey: process.env.COMPLYCUBE_API_TOKEN,
		});

		const client = await complycube.client.create({
			type: "person",
			email: email,
			mobile: phonenumber,
			personDetails: {
				firstName: name,
				lastName: "user",
			},
		});
		const newUser = new User({
			parent_affiliate: user_affiliate_link,
			complyUserId: client.id,
			parentId: parentId,
			name: name,
			language: language,
			email: email,
			phonenumber: phonenumber,
			password: encryptedPassword,
			epassword: password,
			country: country,
			business_name: business_name,
			user_type: user_type,
			business_type: business_type,
			gender: gender,
			application_type: application_type,
			affiliate_url: affiliate_url,
			is_affiliate: is_affiliate,
			is_admin: is_admin,
			is_superadmin: is_superadmin,
			phone: phonenumber,
			whatsapp: whatsapp,
			address: address,
			isTest: istest,
		});

		await newUser.save();

		const defaultSchedule = {
			date: {
				start: "01 January",
				end: "31 December",
			},
			days: [
				{
					day: "Su",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "Mo",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "Tu",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "We",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "Th",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "Fr",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
				{
					day: "Sa",
					start: "00:00 A.M",
					end: "11:59 P.M",
					status: true,
				},
			],
			nameSchedule: "default",
			status: "active",
			userId: newUser?._id,
			venue: "Outcall",
		};

		const CalendarDetails = new calendarSchedule(defaultSchedule);

		await CalendarDetails.save();

		const defaultCalendarRules = {
			userId: newUser?._id,
			requestRules: "Scheduled",
			notificationRule: [
				{ title: "Pending", color: "yellow-500" },
				{ title: "Confirmed", color: "green-500" },
				{ title: "Cancellation", color: "red-500" },
			],
			bufferTime: { day: "00", hr: "00", min: "15" },
			blackOutPeriod: { day: "00", hr: "24", min: "00" },
			member: [{ VIAid: "" }],
		};

		const CalendarRules = new CalendarSetting(defaultCalendarRules);
		await CalendarRules.save();

		const newProfile = new Profile({
			gender: gender,
			country: "United States",
			userId: newUser?._id,
			orientation: gender == "Male" ? "M4W" : "W4M",
			venue: "Incall",
		});

		await newProfile.save();
		const emailMessage = {
			senderAddress: process.env.ACS_EMAIL_SENDER_ADDRESS,
			recipients: {
				to: [
					{
						address: `${req.body.email}`,
						displayName: `${req.body.email}`,
					},
				],
			},
			content: {
				subject: "Welcome to Vairify.io!",
				html: `<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
      <tbody style="box-sizing:border-box">
        <tr style="box-sizing:border-box">
          <td style="box-sizing:border-box">
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:25px 25px 0 0;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="50%" style="font-weight:400;text-align:left;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="width:100%;box-sizing:border-box;padding:30px 0px 20px 30px">
                                  <div align="left" style="line-height:10px;box-sizing:border-box"><a href="https://vairify.io/" style="outline:none;box-sizing:border-box" target="_blank" data-saferedirecturl=""><img src="https://vairify.io/assets/images/home/new_logo.png" style="display:block;height:auto;width:180px;max-width:100%;box-sizing:border-box;border:0" width="180" class="CToWUd" data-bit="iit"></a></div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                          <td width="50%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="padding-right:30px;padding-top:10px;box-sizing:border-box">
                                  <div style="color:#7576ac;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;box-sizing:border-box" align="right">
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0"><a href="https://vairify.io/" style="text-decoration:underline;color:#7576ac;box-sizing:border-box" rel="noopener" target="_blank" data-saferedirecturl="">www.vairify.io</a></p>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:0 0 25px 25px;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:20px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="width:100%;box-sizing:border-box;padding:5px 20px 25px 15px">
                                  <div align="left" style="line-height:10px;box-sizing:border-box"><img src="https://ci6.googleusercontent.com/proxy/Hy6SEeBCvRQ9RNxe6trZY7CFbfmJlsVCzT1NDJeIXuk0iV-i0BYkgfC3C8pT7QMMrf5A0CjS8dWDHohMAB0E7zs-Gaxy29gdRNlH8NVC7095Gsyz2Iy8By9qkTJNzTTEehgZ2VYCg0ocRQdBwRg-DIuXOGWbwWpfMEyn=s0-d-e1-ft#https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/412406_392066/WelcomeImg.png" style="display:block;height:auto;width:565px;max-width:100%;box-sizing:border-box;border:0" width="565" class="CToWUd a6T" data-bit="iit" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 984px; top: 410.016px;"><div id=":nu" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc4MTgzNjg4NDk0NDkyNDUwOSJd" data-tooltip-class="a1V" jsaction="JIbuQc:.CLIENT" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div></div>
                                </td>
                              </tr>
                            </tbody></table>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="padding-bottom:10px;padding-left:30px;padding-right:20px;text-align:center;width:100%;box-sizing:border-box" align="center">
                                  <h1 style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;letter-spacing:normal;line-height:120%;text-align:left;box-sizing:border-box;margin:0" align="left"><strong style="box-sizing:border-box">Welcome to Vairify.io! <img data-emoji="🎉" class="an1" alt="🎉" aria-label="🎉" src="https://fonts.gstatic.com/s/e/notoemoji/15.0/1f389/32.png" loading="lazy"></strong></h1>
                                </td>
                              </tr>
                            </tbody></table>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box;padding:10px 20px 10px 30px">
                                  <div style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;box-sizing:border-box" align="left">
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">Hey ${name},</p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">My name is Brian, and I am the CEO at Vairify.io.<strong style="box-sizing:border-box"> I wanted to personally welcome you to the land of winning ads!&nbsp;</strong><strong style="box-sizing:border-box">I've written down everything you need to know about our platform, to get you up and winning <img data-emoji="💯" class="an1" alt="💯" aria-label="💯" src="https://fonts.gstatic.com/s/e/notoemoji/15.0/1f4af/32.png" loading="lazy"></strong></p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">Our cutting-edge VAI technology serves a dual purpose – not only does it optimize results, but it also acts as a safeguard for our community, ensuring a secure and supportive environment</p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px"><strong style="box-sizing:border-box">Who are we?</strong></p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">We're a Paris-based startup recognized as an 'Innovation Company' by the French government. Operating from Panama, we collaborate with industry leaders like ChainPass and Red Umbrella, dedicated to pioneering cutting-edge technologies.</p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px"><strong style="box-sizing:border-box">Why we built Vairify.io?</strong></p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">We established Vairify.io with a clear mission: to provide businesses with the tools they need for success while fostering a secure community. Our goal is to combine innovation with safety, offering a platform where success and protection go hand in hand</p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px"><strong style="box-sizing:border-box">What about GDPR/Privacy?</strong></p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">At Vairify.io, your data is encrypted to the highest standards. Our robust encryption measures ensure the utmost security for all information shared on our platform, maintaining your confidentiality and peace of mind</p>
                                    
                                    
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="text-align:center;width:100%;box-sizing:border-box;padding: 9px 20px 10px 30px;" align="center">
                                  <h1 style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;letter-spacing:normal;line-height:120%;text-align:left;box-sizing:border-box;margin:0" align="left">Welcome to the Vairify.io Family <img data-emoji="❤️" class="an1" alt="❤️" aria-label="❤️" src="https://fonts.gstatic.com/s/e/notoemoji/15.0/2764_fe0f/32.png" loading="lazy"></h1>
                                </td>
                              </tr>
                            </tbody></table>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="text-align:left;box-sizing:border-box;padding:10px 30px" align="left">
                                  <div align="left" style="box-sizing:border-box">
  <a href="https://vairify.io/" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#ff3067;border-radius:30px;width:auto;font-weight:400;padding-top:10px;padding-bottom:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;text-align:center;word-break:keep-all;box-sizing:border-box;border:0px solid transparent" target="_blank" data-saferedirecturl=""><span style="padding-left:30px;padding-right:30px;font-size:15px;display:inline-block;letter-spacing:normal;box-sizing:border-box"><span dir="ltr" style="word-break:break-word;line-height:30px;box-sizing:border-box"><strong style="box-sizing:border-box">Join Now!</strong></span></span></a>
  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:25px;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="66.66666666666667%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:20px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <div style="box-sizing:border-box">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                                <tbody><tr style="box-sizing:border-box">
                                  <td style="box-sizing:border-box;padding:10px 20px 10px 30px">
                                    <div style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;box-sizing:border-box" align="left">
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0 0 12px"><strong style="box-sizing:border-box">Need help?</strong></p>
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0 0 12px">Contact us at <a href="mailto:support@vairify.date" title="support@vairify.date" style="text-decoration:underline;color:#ff3067;box-sizing:border-box" rel="noopener" target="_blank">support@vairify.date</a></p>
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0">or visit our <a href="https://vairify.io/" rel="noopener" style="text-decoration:underline;color:#ff3067;box-sizing:border-box" target="_blank" data-saferedirecturl="">help center.</a></p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody></table>
                              
                            </div>
                          </td>
                          <td width="33.333333333333336%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <div style="box-sizing:border-box">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                                <tbody><tr style="box-sizing:border-box">
                                  <td style="width:100%;padding-right:0px;padding-left:0px;box-sizing:border-box">
                                    <div align="left" style="line-height:10px;box-sizing:border-box"><img src="https://vairify.io/assets/images/home/new_logo.png" style="display:block;height:auto;width:130px;max-width:100%;box-sizing:border-box;border:0" width="130" class="CToWUd" data-bit="iit"></div>
                                  </td>
                                </tr>
                              </tbody></table>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`,
			},
		}

		const poller = await emailClient.beginSend(emailMessage);
		const response = await poller.pollUntilDone();
		if (response?.status === 'Succeeded') {
			return res.json({
				message: "User registered successfully",
				user: newUser,
			});
		}
		else {
			return res.json({
				message: "Email can not be sent",
				err,
			});
		}

	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
};

export const createUserByAdmin = async (req, res) => {
	let encryptedPassword;
	encryptedPassword = await bcrypt.hash(req.body.password, 10);

	const {
		parentAdminId,
		name,
		email,
		password,
		country,
		user_type,
		business_name,
		business_type,
		gender,
		application_type,
		affiliate_url,
		user_affiliate_link,
		is_affiliate,
		is_admin,
	} = req.body;
	try {
		const parentAdmin = await User.findById(parentAdminId);
		if (!parentAdmin) {
			return res.status(404).json({ error: "Parent admin not found." });
		}

		const newUser = new User({
			parent: parentAdminId,
			parent_affiliate: user_affiliate_link,
			name: name,
			email: email,
			password: encryptedPassword,
			epassword: password,
			country: country,
			business_name: business_name,
			user_type: user_type,
			business_type: business_type,
			gender: gender,
			application_type: application_type,
			affiliate_url: affiliate_url,
			is_affiliate: is_affiliate,
			is_admin: is_admin,
		});
		await newUser.save(newUser);
		return res.json({
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: "An error occurred while creating the user.",
		});
	}
};

export const getUsersUnderAdmin = async (req, res) => {
	const { adminId } = req.params;

	try {
		const users = await User.find({ parentId: adminId });

		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching users under admin.",
		});
	}
};

const getUsers = async (req, res) => {
	const { id } = req.params;

	try {
		const users = await User.findById(id);

		res.status(200).json({
			user: users,
		});
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching users under admin.",
		});
	}
};

const getUsersWithIsTestFalse = async (req, res) => {
	try {
		const users = await User.find({ isTest: false });

		res.status(200).json({
			user: users,
		});
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching users under admin.",
		});
	}
};

const loginUser = async (req, res) => {

	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({
				message: 'User with this email does not exist!',
			});
		}

		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({
				message: 'Invalid email or password!',
			});
		}


		// if (user && bcrypt.compareSync(password, user.password)) {
		const resetCode = Math.floor(
			100000 + Math.random() * 900000,
		).toString(); // Generate a 6-digit code
		user.resetCode = resetCode;
		console.log("login otp", resetCode)
		await user.save();
		const emailMessage = {
			senderAddress: process.env.ACS_EMAIL_SENDER_ADDRESS,
			recipients: {
				to: [
					{
						address: `${req.body.email}`,
						displayName: `${req.body.email}`,
					},
				],
			},
			content: {
				subject: "Vairify Login",
				html: `<h2>Hello ${req.body.email}</h2>
			<p>An OTP request has been received to for your <strong>VAI</strong> account </p>
	  
	  
			  <p style="margin-bottom:20px;">Use the Below Code to verify the OTP</p>
	  
			  <a href="#" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">${resetCode} </a>
	  
			  
			  <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@vai.com</p>
	  
			  <p style="margin-bottom:0px;">Thank you</p>
			  <strong>VAI Team</strong>
				   `,
			},
		}

		const poller = await emailClient.beginSend(emailMessage);
		const response = await poller.pollUntilDone();

		if (response?.status === 'Succeeded') {
			return res.json({
				message: "Email has been sent",
			});
		}
		else {
			return res.json({
				message: 'Failed to send the email.',
				err,
			});
		}

		// return res.json({
		// 	message: "message sent",
		// });

		// }
		// else {
		// 	res.status(401).send({
		// 		message: "Invalid Email or password!",
		// 	});

	} catch (error) {
		console.log(error);
		res.status(501).send({
			message: 'Not a valid email address!',
		});
	}
};

const getUpdatedInfo = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId)
			.populate("subscription.transactionId")
			.populate("kyc.transactionId");

		if (user?._id) {
			const profileReviews = await Reviews?.find({ reviewee: user?._id });
			const givenReviews = await Reviews?.find({ reviewer: user?._id });
			const followers = await Follower?.find({ follower_id: user?._id });
			const favourites = await Favourite?.find({ userId: user?._id });

			res.send({
				...JSON.parse(JSON.stringify(user)),
				profileReviews,
				givenReviews,
				followers,
				favourites,
			});
		} else {
			res.status(401).send({
				message: "User not found!",
			});
		}
	} catch (error) {
		console.log(error, " <== error");
		res.status(500).json(error);
	}
};

const checkAffiliateValidity = async (req, res) => {
	try {
		const user = await User.findOne({
			referralCode: req.body.parent_affiliate,
		});

		const isValidAffiliate = user !== null;

		if (isValidAffiliate) {
			res.status(200).send({
				message: "Valid affiliate URL!",
			});
		} else {
			res.status(401).send({
				message: "Invalid affiliate URL!",
			});
		}
	} catch (error) {
		res.status(500).json(error);
	}
};

const getNetworks = async (req, res) => {
	try {
		const { userId } = req.params;
		const currentUser = await User.findById(userId);
		if (!currentUser) {
			return res.status(404).json({ error: "User not found" });
		}
		const usersUnderCurrentAffiliate = await User.find({
			parent_affiliate: currentUser.referralCode,
		});

		const usersUnderCurrentAffiliateReferralCodes =
			usersUnderCurrentAffiliate.map(user => user.referralCode);
		const allAffiliates = await User.find({
			parent_affiliate: { $in: usersUnderCurrentAffiliateReferralCodes },
		});
		const network = {
			currentUser: currentUser,
			currentUserAffiliate: usersUnderCurrentAffiliate.map(affiliate => {
				return {
					affiliate: affiliate,
					affiliatesArray: allAffiliates.filter(
						user =>
							user.parent_affiliate === affiliate.referralCode,
					),
				};
			}),
		};

		return res.json(network);
	} catch (error) {
		res.status(500).json(error);
	}
};

const forgetPassword = async (req, res) => {
	console.log("I'm here");
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		res.status(500).json({ message: "User not found" });
	} else {
		const resetCode = Math.floor(
			100000 + Math.random() * 900000,
		).toString(); // Generate a 6-digit code
		user.resetCode = resetCode;
		console.log(resetCode, "forgetPassword otp")
		await user.save();
		const emailMessage = {
			senderAddress: process.env.ACS_EMAIL_SENDER_ADDRESS,
			recipients: {
				to: [
					{
						address: `${req.body.email}`,
						displayName: `${req.body.email}`,
					},
				],
			},
			content: {
				subject: "Reset Your Password",
				html: `<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
      <tbody style="box-sizing:border-box">
        <tr style="box-sizing:border-box">
          <td style="box-sizing:border-box">
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:25px 25px 0 0;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="50%" style="font-weight:400;text-align:left;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="width:100%;box-sizing:border-box;padding:30px 0px 20px 30px">
                                  <div align="left" style="line-height:10px;box-sizing:border-box"><a href="#" style="outline:none;box-sizing:border-box" target="_blank"><img src="https://vairify.io/assets/images/home/new_logo.png" style="display:block;height:auto;width:180px;max-width:100%;box-sizing:border-box;border:0" width="180" class="CToWUd" data-bit="iit"></a></div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                          <td width="50%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="padding-right:30px;padding-top:10px;box-sizing:border-box">
                                  <div style="color:#7576ac;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;box-sizing:border-box" align="right">
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0"><a href="https://vairify.io/" style="text-decoration:underline;color:#7576ac;box-sizing:border-box" rel="noopener" target="_blank">vairify.io</a></p>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:0 0 25px 25px;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:20px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="width:100%;box-sizing:border-box;padding:5px 20px 25px 15px">
                                  <div align="left" style="line-height:10px;box-sizing:border-box"><img src="https://tlr.stripocdn.email/content/guids/CABINET_980d61be271c5c78421ebc7519d21662/images/group_41.png" style="display:block;height:auto;width:565px;max-width:100%;box-sizing:border-box;border:0" width="565" class="CToWUd a6T" data-bit="iit" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 984px; top: 410.016px;"><div id=":nu" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc4MTgzNjg4NDk0NDkyNDUwOSJd" data-tooltip-class="a1V" jsaction="JIbuQc:.CLIENT" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div></div>
                                </td>
                              </tr>
                            </tbody></table>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="padding-bottom:10px;padding-left:30px;padding-right:20px;text-align:center;width:100%;box-sizing:border-box" align="center">
                                  <h1 style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;letter-spacing:normal;line-height:120%;text-align:left;box-sizing:border-box;text-align: center;margin:0" align="left"><strong style="box-sizing:border-box">Trouble logging in?</strong></h1>
                                </td>
                              </tr>
                            </tbody></table>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box;padding:10px 20px 10px 30px">
                                  <div style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;box-sizing:border-box" align="left">
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">Hi</p>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px">We've received a request to reset the password for the Stripe account associated with ${req.body.email}<strong style="box-sizing:border-box"> Use the Bellow code to reset your password</strong></p><div style="
      text-align: center;
      margin-bottom: 16px;
  "><span class="es-button-border" style="border-style:solid;border-color:#CCCCCC;background:#2CB543;border-width:2px;display:inline-block;border-radius:0px;width:auto"><span class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'lucida sans unicode', 'lucida grande', sans-serif;font-size:16px;color:#333333;border-style:solid;border-color:#FFFFFF;border-width:10px 20px 10px 20px;display:inline-block;background:#FFFFFF;border-radius:0px;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center">${resetCode}</span></span></div>
                                    <p style="box-sizing:border-box;line-height:inherit;margin:0 0 16px"><strong style="box-sizing:border-box">If you did not make this request then please ignore this email</strong></p>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;color:#000000;border-radius:25px;width:600px;box-sizing:border-box" width="600" bgcolor="#ffffff">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="66.66666666666667%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:20px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <div style="box-sizing:border-box">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                                <tbody><tr style="box-sizing:border-box">
                                  <td style="box-sizing:border-box;padding:10px 20px 10px 30px">
                                    <div style="color:#605880;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;box-sizing:border-box" align="left">
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0 0 12px"><strong style="box-sizing:border-box">Need help?</strong></p>
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0 0 12px">Contact us at <a href="mailto:support@vairify.date" title="support@vairify.date" style="text-decoration:underline;color:#ff3067;box-sizing:border-box" rel="noopener" target="_blank">support@vairify.date</a></p>
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0">or visit our <a href="https://vairify.io/" rel="noopener" style="text-decoration:underline;color:#ff3067;box-sizing:border-box" target="_blank">help center.</a></p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody></table>
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="word-break:break-word;box-sizing:border-box">
                                <tbody><tr style="box-sizing:border-box">
                                  <td style="box-sizing:border-box;padding:10px 10px 20px 30px">
                                    <div style="color:#101112;direction:ltr;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;box-sizing:border-box" align="left">
                                      <p style="box-sizing:border-box;line-height:inherit;margin:0"><a href="#" rel="noopener" style="text-decoration:underline;color:#938ea9;box-sizing:border-box" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://email.Vairify.io/unsubscribe/dgSR6wYAAITOQYPOQQGLpbNJB-Z_BfDNbDsyNM0%3D&amp;source=gmail&amp;ust=1699439975031000&amp;usg=AOvVaw19WXl5jIbEDP-n54PxLVXq">Unsubscribe.</a></p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody></table>
                            </div>
                          </td>
                          <td width="33.333333333333336%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:middle;box-sizing:border-box;border:0px" align="left" valign="middle">
                            <div style="box-sizing:border-box">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing:border-box">
                                <tbody><tr style="box-sizing:border-box">
                                  <td style="width:100%;padding-right:0px;padding-left:0px;box-sizing:border-box">
                                    <div align="left" style="line-height:10px;box-sizing:border-box"><img src="https://vairify.date/assets/images/favicon.png" style="display:block;height:auto;width:130px;max-width:100%;box-sizing:border-box;border:0" width="130" class="CToWUd" data-bit="iit"></div>
                                  </td>
                                </tr>
                              </tbody></table>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;box-sizing:border-box" bgcolor="#fbf7fd">
              <tbody style="box-sizing:border-box">
                <tr style="box-sizing:border-box">
                  <td style="box-sizing:border-box">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fbf7fd;border-radius:0;color:#000000;width:600px;box-sizing:border-box" width="600" bgcolor="#fbf7fd">
                      <tbody style="box-sizing:border-box">
                        <tr style="box-sizing:border-box">
                          <td width="100%" style="font-weight:400;text-align:left;padding-bottom:5px;padding-top:5px;vertical-align:top;box-sizing:border-box;border:0px" align="left" valign="top">
                            <table width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="box-sizing:border-box">
                              <tbody><tr style="box-sizing:border-box">
                                <td style="box-sizing:border-box">
                                  <div align="center" style="box-sizing:border-box">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="box-sizing:border-box">
                                      <tbody><tr style="box-sizing:border-box">
                                        <td style="font-size:1px;line-height:1px;border-top-width:1px;border-top-color:#fbf7fd;border-top-style:solid;box-sizing:border-box"><span style="box-sizing:border-box">&hairsp;</span></td>
                                      </tr>
                                    </tbody></table>
                                  </div>
                                </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`,
			},
		}

		const message = "Please check your email to reset password!";
		const poller = await emailClient.beginSend(emailMessage);
		const response = await poller.pollUntilDone();
		if (response?.status === 'Succeeded') {
			return res.json({
				message: "Email has been sent",
			});
		}
		else {
			return res.json({
				message: "Email can not be sent",
				err,
			});
		}

	}
};

const resendOtp = async (req, res) => {
	try {
		const { email, login } = req?.body;
		const user = await User.findOne({ email: email });
		if (!user) {
			res.status(500).json({ message: "User not found" });
		} else {
			const resetCode = Math.floor(
				100000 + Math.random() * 900000,
			).toString(); // Generate a 6-digit code
			user.resetCode = resetCode;
			console.log(resetCode, "otp send otp ")
			await user.save();
			const emailMessage = {
				senderAddress: process.env.ACS_EMAIL_SENDER_ADDRESS,
				recipients: {
					to: [
						{
							address: `${req.body.email}`,
							displayName: `${req.body.email}`,
						},
					],
				},
				content: {
					subject: login ? "Vairify Login" : "Vairify Registration",
					html: `<h2>Hello ${req.body.email}</h2>
		<p>An OTP request has been received to for your <strong>VAI</strong> account </p>
  
  
		<p style="margin-bottom:20px;">Use the Below Code to verify the OTP</p>
		
		<a href="#" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">${resetCode} </a>
		
		
		<p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@vai.com</p>
		
		<p style="margin-bottom:0px;">Thank you</p>
		<strong>VAI Team</strong>
		`,
				},
			}

			const poller = await emailClient.beginSend(emailMessage);
			const response = await poller.pollUntilDone();
			if (response?.status === 'Succeeded') {
				return res.json({
					message: "Email has been sent",
				});
			}
			else {
				return res.json({
					message: "Email can not be sent",
					err,
				});
			}

		}
	}
	catch (error) {
		console.error(error);
	}
};

const optSend = async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		res.status(500).json({ message: "User not found" });
	} else {
		const resetCode = Math.floor(
			100000 + Math.random() * 900000,
		).toString(); // Generate a 6-digit code
		user.resetCode = resetCode;
		console.log(resetCode, "otp send otp ")
		await user.save();
		const emailMessage = {
			senderAddress: process.env.ACS_EMAIL_SENDER_ADDRESS,
			recipients: {
				to: [
					{
						address: `${req.body.email}`,
						displayName: `${req.body.email}`,
					},
				],
			},
			content: {
				subject: "Vairify Registration",
				html: `<h2>Hello ${req.body.email}</h2>
		<p>An OTP request has been received to for your <strong>VAI</strong> account </p>
  
  
		  <p style="margin-bottom:20px;">Use the Below Code to verify the OTP</p>
  
		  <a href="#" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">${resetCode} </a>
  
		  
		  <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@vai.com</p>
  
		  <p style="margin-bottom:0px;">Thank you</p>
		  <strong>VAI Team</strong>
			   `,
			},
		}

		const poller = await emailClient.beginSend(emailMessage);
		const response = await poller.pollUntilDone();
		if (response?.status === 'Succeeded') {
			return res.json({
				message: "Email has been sent",
			});
		}
		else {
			return res.json({
				message: "Email can not be sent",
				err,
			});
		}

	}
};

const verifyResetCodeAndResetPassword = async (req, res) => {
	const { email, resetCode, newPassword } = req.body;
	console.log(resetCode, "verify reset code and password otp")

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(500).json({
				message: "User not found",
			});
		}

		// if (user.resetCode !== resetCode) {
		//   return res.json({
		//     message: "Invalid reset code",
		//   });
		// }

		// Generate encrypted password using bcrypt
		const encryptedPassword = await bcrypt.hash(newPassword, 10);

		// Reset the password
		user.password = encryptedPassword;
		user.epassword = newPassword;
		user.resetCode = ""; // Remove the reset code
		await user.save();

		return res.json({
			message: "Password reset successful",
		});
	} catch (error) {
		return res.json({
			message: "An error occurred while resetting password",
		});
	}
};

const verifyOtp = async (req, res) => {
	const { email, otpCode } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({
				message: "User not found",
			});
		}

		if (user.resetCode !== otpCode) {
			return res.status(401).json({
				message: "Invalid OTP Code",
			});
		}

		const token = signInToken(user);
		const profileReviews = await Reviews?.find({ reviewee: user?._id });
		const givenReviews = await Reviews?.find({ reviewer: user?._id });
		const followers = await Follower?.find({ follower_id: user?._id });
		const favourites = await Favourite?.find({ userId: user?._id });
		const personalInformation = await Profile?.findOne({
			userId: user?._id,
		});

		user.resetCode = ""; // Remove the reset code
		await user.save();

		res.send({
			token,
			user: {
				...JSON.parse(JSON.stringify(user)),
				profileReviews,
				givenReviews,
				followers,
				favourites,
				personalInformation,
			},
		});
	} catch (error) {
		return res.json({
			message: "An error occurred while confirming OTP Code",
			error,
		});
	}
};

const getUserTokens = async (req, res) => {
	try {
		const userId = req.params.userId;

		const user = await User.findById(userId).select("tokens");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ tokens: user.tokens });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

export const addTokensToUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const { tokensToAdd } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Update the user's tokens
		user.tokens += tokensToAdd;

		await user.save();

		res.status(200).json({ message: "Tokens added successfully", user });
	} catch (error) {
		console.error("Error adding tokens:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const uploadUserProfile = async (req, res) => {
	try {
		const files = req.files;
		const fields = req.fields;
		console.log(files, "File and Feilds");

		console.log(files.filename.filename, files.filename.mimeType, files.buffer, fields.userId, "File and Feilds");
		var image = "";

		// const timestamp = moment().format("YYYYMMDDHHmmss");
		// const originalname = req.file.originalname.replace(/ /g, "");

		// const filename = `${timestamp}-${originalname}`;
		// image = filename;

		if (files) {
			await uploadToS3("usersProfile", files.buffer, files.filename.filename, files.filename.mimeType)
				.then((res) => {
					image = res;
					console.log(res, "Image link")
				})
				.catch((err) => {
					console.log("Error Upload Profile", err);
				});
		}
		console.log(image, "uploadFaceVerificationImage  profie")

		const userProfile = await User.findByIdAndUpdate(fields.userId, {
			profilePic: image,
		});

		if (!userProfile) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
			message: "Profile photo uploaded successfully",
		});
	} catch (error) {
		console.error("An error occurred:", error);
		res.status(500).json({
			error: "An error occurred while uploading the profile photo",
		});
	}
};


const uploadFaceVerificationImage = async (req, res) => {
	try {
		const userId = req.fields.userId;
		const files = req.files || [];
		const folderName = "faceimages";
		var image = "";
		if (files) {
			await uploadToS3(folderName, files.buffer, files.filename.filename, files.filename.mimeType)
				.then(url => {
					console.log('File uploaded successfully in Marketplace post:', url);
					image = url;
				})
				.catch(err => console.error('Error uploading file in Marketplace post:', err));
		}
		const faceDetected = await detectFace(image);
		if (!faceDetected) {
			console.log('No faces detected in the image.');
			return res.status(400).json({
				message: "No faces detected in the image.",
			});
		}

		console.log(image, "uploadFaceVerificationImage  profie")

		// const userProfile = await User.findByIdAndUpdate(userId, {
		// 	faceVerificationImage: image,
		// });
		const userProfile = await User.findByIdAndUpdate(
			userId,
			{ faceVerificationImage: image },
			{ new: true } // This ensures the updated document is returned
		);

		if (!userProfile) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(userProfile);
	} catch (error) {
		console.error("An error occurred:", error);
		res.status(500).json({
			error: "An error occurred while uploading the profile photo",
		});
	}
};

const checkUserPassword = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find the user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (isPasswordCorrect) {
			return res.json({ message: "Password is correct" });
		} else {
			return res.status(401).json({ error: "Incorrect password" });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

const verifyFace = async (req, res) => {
	try {
		const { userId } = req.params;
		const file = req.files;
		const folderName = "usersFacesTemp";

		if (!file) {
			return res.status(400).send({ error: "Please upload proof" });
		}

		var image = "";
		await uploadToS3(folderName, file.buffer, file.filename.filename, file.filename.mimeType)
			.then((res) => {
				image = res;
				console.log(res, "Image link")
			})
			.catch((err) => {
				console.log("Error Upload Profile", err);
			});
		const user = await User.findOne({ _id: userId });
		// const kyc = await KYCDetails.findOne({ userId });

		// if (!user.profilePic || !kyc || !kyc.livePhotoFile) {
		// 	return res.status(400).send({ error: "Face did not match" });
		// }

		await compareFaces(image, user?.faceVerificationImage)
			.then(result => {
				if (result.matches.length > 0) {
					console.log('Faces match with similarity:', result.matches[0].similarity);
					return res.send({ message: "Face verified" });
				} else {
					console.log('No matching faces found.');
					return res.status(400).send({ error: "Face did not match" });
				}
			})
			.catch((error) => {
				console.error("Error in verifyFace compareFace call: ", error)
				return res.status(500).json({ error: "Please capture your face in camera." });
			});

	} catch (error) {
		console.error("Error in verifyFace : ", error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

const saveLocation = async (req, res) => {
	try {
		const { userId } = req.params;
		const { country, city } = req.body;

		// Find the user by email
		const user = await User.findOne({ _id: userId });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const existingLoc = user.savedLocations.find(
			loc => loc.country === country && loc.city === city,
		);
		if (!existingLoc) {
			user.savedLocations.push({ country, city });
			await user.save();
		}
		return res.send(user.savedLocations);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

const getUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.send(user);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

const getMarketPlaceUser = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log(userId);
		const profiles = await profileDetails.aggregate([
			{
				$match: { userId: new mongoose.Types.ObjectId(userId) },
			},
			{
				$lookup: {
					from: "services", // Collection name for services
					localField: "userId",
					foreignField: "userId",
					as: "services",
				},
			},
			{
				$lookup: {
					from: "users", // Collection name for users
					localField: "userId",
					foreignField: "_id",
					as: "userId",
					pipeline: [
						{
							$lookup: {
								from: "reviews",
								localField: "_id",
								foreignField: "reviewee",
								as: "reviews",
							},
						},
					],
				},
			},
			{
				$unwind: "$userId",
			},
			{
				$unwind: "$services",
			},
		]);

		const result = profiles.map((profile, index) => {
			let data = { profile };
			data.services = data.profile.services;
			delete data.profile.services;
			return data;
		});
		return res.send(result);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

const verifyPhoneNumber = async (req, res) => {
	try {
		const { phoneNumber, memberId } = req.body;

		const smsCode = generateRandomCode();

		console.log(`Please enter this ${smsCode}`); // for development purposes only

		const member = await User.findById(memberId);
		member.verifyOtp = smsCode;
		await member.save();

		await sendSMS(phoneNumber, smsCode);

		res.status(200).json({ message: "Code sent successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to send verification code." });
	}
};

const verifyOtpNumber = async (req, res) => {
	try {
		const { otp, memberId } = req.body;

		const member = await User.findById(memberId);

		if (member.verifyOtp === otp) {
			member.is_phone_verified = true;
			member.verifyOtp = "";
			await member.save();

			res.status(200).json({ message: "OTP verified successfully" });
		} else {
			res.status(400).json({ error: "Invalid OTP" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to verify OTP" });
	}
};

const userChangePassword = async (req, res) => {
	try {
		const { email, newPassword } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
		user.password = hashedPassword;
		user.epassword = newPassword;

		await user.save();

		return res
			.status(200)
			.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error changing password:", error.message);
		return res.status(500).json({ error: "Failed to change password" });
	}
};

const userPhoneResetPass = async (req, res) => {
	const { phone } = req.body;
	const user = await User.findOne({ phone });
	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	const resetCode = generateRandomCode();
	user.resetCode = resetCode;
	console.log(resetCode, "phone reset otp");
	await user.save();
	await sendForgotSMS(phone, resetCode);
	return res.status(200).json({ message: "Code Send!" });
};

const userPhoneResetPassVerify = async (req, res) => {
	try {
		const { phone, code } = req.body;

		// Find the user with the provided phone number
		const user = await User.findOne({ phone });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Check if the provided code matches the stored resetCode
		if (code !== user.resetCode) {
			return res.status(401).json({ error: "Invalid verification code" });
		}

		// Clear the resetCode after successful verification
		user.resetCode = "";
		await user.save();

		return res.status(200).json({ message: "Verification successful" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};

const userChangePasswordByPhone = async (req, res) => {
	try {
		const { phone, newPassword } = req.body;

		const user = await User.findOne({ phone });

		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
		user.password = hashedPassword;
		user.epassword = newPassword;

		await user.save();

		return res
			.status(200)
			.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error changing password:", error.message);
		return res.status(500).json({ error: "Failed to change password" });
	}
};

const generateSDKToken = async (req, res) => {
	const complycube = new ComplyCube({
		apiKey: process.env.COMPLYCUBE_API_TOKEN,
	});

	try {
		const { clientId } = req.body;
		console.log(clientId);
		const token = await complycube.token.generate(clientId, {
			referrer: "https://www.example.com/*",
		});

		if (token) {
			res.status(200).json({ token });
		} else {
			res.status(500).json({ error: "Failed to generate SDK token" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to generate SDK token" });
	}
};

const getIncallAddresses = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}
		return res.send(user.incallAddresses);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const saveIncallAddresses = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}

		const updateResponse = await User.updateOne(
			{ _id: userId },
			{ $push: { incallAddresses: req.body } },
		);
		return res.send(updateResponse);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const updateIncallAddresses = async (req, res) => {
	try {
		const { userId, id } = req.params;
		const user = (await User.findOne({ _id: userId })).toJSON();
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}

		const addrs = user.incallAddresses.map(addr => {
			if (addr?._id?.toString() === id) {
				return { ...addr, ...req.body };
			} else {
				return addr;
			}
		});

		const updateResponse = await User.updateOne(
			{ _id: userId },
			{ incallAddresses: addrs },
		);
		return res.send(updateResponse);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const getAvailableStatus = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}
		return res.send(user.vaiNowAvailable || {});
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const updateAvailableStatus = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}
		const payload = req.body;
		user.vaiNowAvailable = payload; // expecting { availableFrom: date, duration: 60, venue: '', isPrivate: false }

		const updateResponse = await user.save();
		return res.send(updateResponse);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const getFavLocations = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}
		return res.send(user.savedLocations);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const updateUserPreferences = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isBetaTester, notifyOnRelease } = req.body;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{
				isBetaTester,
				notifyOnRelease,
			},
			{ new: true },
		);

		return res.send(updatedUser);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const signContract = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });

		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}

		const updatedUser = await User.findByIdAndUpdate(userId, {
			mutualContractSigned: true,
		});

		return res.send(updatedUser);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

const changePassword = async (req, res) => {
	try {
		const { userId } = req.params;
		const { currentPassword, newPassword } = req.body;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).send({ error: "User not found." });
		}

		if (user.epassword !== currentPassword) {
			return res.status(400).send({ error: "Invalid Current Password" });
		}

		let encryptedPassword = await bcrypt.hash(newPassword, 10);

		const updatedUser = await User.findByIdAndUpdate(userId, {
			password: encryptedPassword,
			epassword: newPassword,
		});

		return res.send(updatedUser);
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Something went wrong" });
	}
};

export {
	getUsersWithIsTestFalse,
	createUser,
	loginUser,
	getUpdatedInfo,
	checkAffiliateValidity,
	getNetworks,
	forgetPassword,
	verifyResetCodeAndResetPassword,
	optSend,
	resendOtp,
	verifyOtp,
	getUserTokens,
	uploadUserProfile,
	getUsers,
	checkUserPassword,
	verifyFace,
	saveLocation,
	getUser,
	getMarketPlaceUser,
	verifyPhoneNumber,
	verifyOtpNumber,
	userChangePassword,
	userPhoneResetPass,
	userPhoneResetPassVerify,
	userChangePasswordByPhone,
	generateSDKToken,
	getIncallAddresses,
	saveIncallAddresses,
	updateIncallAddresses,
	getAvailableStatus,
	updateAvailableStatus,
	getFavLocations,
	updateUserPreferences,
	signContract,
	changePassword,
	uploadFaceVerificationImage,
};

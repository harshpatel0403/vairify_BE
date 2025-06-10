import express from "express"
import { getDateHistory, getPushNotification, setPushNotification } from "../Controllers/SettingsController.js"

const SettingsRoute = express.Router()

SettingsRoute.post('/push-notification/status', setPushNotification)
SettingsRoute.get('/push-notification/status', getPushNotification)
SettingsRoute.get('/date-history', getDateHistory)

export default SettingsRoute
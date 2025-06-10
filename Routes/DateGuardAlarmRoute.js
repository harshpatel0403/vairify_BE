import express from 'express';
import { getAlarmDetails } from '../Controllers/DateGuardAlarmController.js';

const dateGuardAlarmrouter = express.Router();  

dateGuardAlarmrouter.get('/:alarmId', getAlarmDetails);

export default dateGuardAlarmrouter;

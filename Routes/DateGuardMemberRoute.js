import express from "express"
import { createMember, getMembers,verifySmsCode } from "../Controllers/DateGuardMemberController.js";

const dateGuardMemberrouter = express.Router()

dateGuardMemberrouter.post('/add/:userId', createMember)
dateGuardMemberrouter.get('/:userId', getMembers)
dateGuardMemberrouter.post('/verify-sms-code', verifySmsCode)


export default dateGuardMemberrouter;
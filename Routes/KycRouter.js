import express from "express"
import { AddDoc,UploadFrontDoc,UploadBackDoc,LivePhoto,RunCheck,getCheckResult , validateDocument , DocCheckstatus } from "../Controllers/KycController.js";

const KycRouter = express.Router()

KycRouter.post('/addDoc', AddDoc)
KycRouter.post('/uploadfrontDoc', UploadFrontDoc)
KycRouter.post('/uploadBackDoc', UploadBackDoc)
KycRouter.post('/livePhoto', LivePhoto)
KycRouter.post('/runCheck', RunCheck)
KycRouter.post('/getResults', getCheckResult)
KycRouter.get('/DocCheckstatus' , DocCheckstatus)
KycRouter.post('/validateDocument', validateDocument)

export default KycRouter;
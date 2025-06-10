import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    companionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    duration: {
        type: Number
    },
    endDateTime: {
        type: Date
    },
    startDateTime: {
        type: Date
    },
    extras: {
        type: Array
    },
    type: {
        type: String
    },
    clientStatus: {
        type: String
    },
    companionStatus: {
        type: String
    },
    message: {
        type: String
    },
    service: {
        servicesName: String,
        _id: String
    },
    manualSelfie: {
        file: {
            type: String
        },
        path: {
            type: String
        },
    },
    manualSelfieCompanion: {
        file: {
            type: String
        },
        path: {
            type: String
        },
    },
    location: {
        city: String,
        country: String,
        address: String,
        addressLine1: String,
        landmark: String,
        lat: String,
        lng: String,
        _id: String
    },
    agreedPrice: {
        type: Number
    },
    rejectionMessage: {
        type: String
    },
    isModified: {
        type: Boolean
    },
    lastMileInst: {
        type: String
    },
    cancellationRequested: {
        type: Boolean
    },
    cancellationRequestedBy: {
        type: String
    },
    companionGCalSyncId: {
        type: String
    },
    ClientGCalSyncId: {
        type: String
    },
    companionOCalSyncId: {
        type: String
    },
    ClientOCalSyncId: {
        type: String
    },
    vaiCheckStatus: {
        companionStatus: { type: String, default: "Pending" },
        clientStatus: { type: String, default: "Pending" }
    }
}, { timestamps: true, suppressReservedKeysWarning: true })

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
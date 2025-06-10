import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number
    },
    message: {
        type: String
    },
    puncutality: Number,
    etequette: Number,
    attitude: Number,
    paid: Boolean
}, { timestamps: true })

const Reviews = mongoose.model("Reviews", reviewSchema);
export default Reviews;
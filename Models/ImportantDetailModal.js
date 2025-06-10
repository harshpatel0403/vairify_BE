import mongoose from "mongoose";

const importantDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});


const ImportantDetail = mongoose.model('ImportantDetail', importantDetailSchema);

export default ImportantDetail;

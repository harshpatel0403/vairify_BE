import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gender: {
    type: String,
    default: '',
  },
  orientation: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  ethnicity: {
    type: String,
    default: '',
  },
  nationality: {
    type: String,
    default: '',
  },
  smoker: {
    type: Boolean,
    default: false,
  },
  build: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '',
  },
  eyeColor: {
    type: String,
    default: '',
  },
  hairLength: {
    type: String,
    default: '',
  },
  hairColor: {
    type: String,
    default: '',
  },
  weight: {
    type: String,
    default: '',
  },
  pubicHair: {
    type: String,
    default: '',
  },
  piercing: {
    type: String,
    default: '',
  },
  tattoo: {
    type: String,
    default: '',
  },
  travel: {
    type: Boolean,
    default: false,
  },
  venue: {
    type: String,
    default: '',
  },
  virtualServices: {
    type: String,
    default: '',
  },
  communication: {
    type: String,
    default: '',
  },
  breastType: {
    type: String,
    default: '',
  },
  breastSize: {
    type: String,
    default: '',
  },
  breastAppearance: {
    type: String,
    default: '',
  },
  onlyFans: {
    type: String,
    default: '',
  },
  pornstar: {
    type: String,
    default: '',
  },
  penisSize: {
    type: String,
    default: '',
  },
  description:{
    type: String,
    default:""
  }
},
{
  timestamps: true,
});

const UserDetails = mongoose.models.UserDetails || mongoose.model('UserDetails', userDetailsSchema);

export default UserDetails;

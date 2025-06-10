import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const varipaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
});

const socialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const countriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    languages: [languageSchema],
    cities: [citySchema],
    varipays: [varipaySchema],
    social:[socialSchema],
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.model("Country", countriesSchema);

export default Country;

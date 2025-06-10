import ContactAdmin from "../Models/ContactAdmin.js";

export const createContact = async (req, res) => {
  const { firstName, lastName, message, email,phone } = req.body;
  try {
    console.log(req.body)
    const newContact = new ContactAdmin({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the contact." });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactAdmin.find();

    res.status(200).json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching contacts." });
  }
};

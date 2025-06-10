import UserVaripayRequest from "../Models/UserVaripayRequest.js";

export const createUserVaripayRequest = async (req, res) => {
  try {
    const { requester, targetUser, amount, comment } = req.body;

    // Create a new request
    const newRequest = new UserVaripayRequest({
      requester,
      targetUser,
      amount,
      comment,
    });

    // Save the new request to the database
    const savedRequest = await newRequest.save();

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error saving user request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getUserVaripayRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all requests targeting the specified user and populate the requester and targetUser fields
    const requests = await UserVaripayRequest.find({ targetUser: id })
      .populate("requester", "-password") // Exclude the password field
      .populate("targetUser", "-password"); // Exclude the password field

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error retrieving requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUserVaripayRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const deletedRequest = await UserVaripayRequest.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({ error: "Varipay request not found" });
    }

    return res.status(200).json({ message: "Varipay request deleted successfully" });
  } catch (error) {
    console.error("Error deleting Varipay request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateVaripayRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { slug } = req.body;
    const User = await UserVaripayRequest.findByIdAndUpdate(requestId, {
      slug
    });

    // const deletedRequest = await UserVaripayRequest.findByIdAndDelete(requestId);

    // if (!deletedRequest) {
    //   return res.status(404).json({ error: "Varipay request not found" });
    // }

    return res.status(200).json({ message: "Varipay request updated successfully" });
  } catch (error) {
    console.error("Error updating Varipay request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



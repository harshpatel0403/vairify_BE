import DateGuardCodes from "../Models/DateGuardCodeModal.js";

export const getDateGuardCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const dateGuardCode = await DateGuardCodes.findById(id);
    if (!dateGuardCode) {
      res.status(404).json({ error: "DateGuardCode not found." });
    } else {
      res.status(200).json(dateGuardCode);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateDateGuardCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDateGuardCode = await DateGuardCodes.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedDateGuardCode) {
      res.status(404).json({ error: "DateGuardCode not found." });
    } else {
      res.status(200).json(updatedDateGuardCode);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteDateGuardCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDateGuardCode = await DateGuardCodes.findByIdAndRemove(id);
    if (!deletedDateGuardCode) {
      res.status(404).json({ error: "DateGuardCode not found." });
    } else {
      res.status(200).json({ message: "DateGuardCode deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const createOrUpdateDateGuardCodes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { disarm, decoy } = req.body;

    let dateGuardCodes = await DateGuardCodes.findOne({ userId });
    console
    if (!dateGuardCodes) {
      dateGuardCodes = await DateGuardCodes.create({
        userId,
        disarm,
        decoy,
      });
      res.status(201).json(dateGuardCodes);
    } else {
      dateGuardCodes.disarm = disarm;
      dateGuardCodes.decoy = decoy;
      await dateGuardCodes.save();
      res.status(200).json(dateGuardCodes);
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Unable to create or update DateGuardCodes." });
  }
};

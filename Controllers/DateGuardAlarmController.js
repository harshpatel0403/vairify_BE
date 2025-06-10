import DateGuardAlarms from "../Models/DateGuardAlarmModal.js";


const getAlarmDetails = async (req, res) => {
  try {
    const { alarmId } = req.params;

    const alarmDetails = await DateGuardAlarms.findById(alarmId).populate('appointmentId').populate('groupId');

    res.status(201).json(alarmDetails);
  } catch (error) {
    console.error("Error alarm details:", error);
    res.status(500).json({ error: "Failed to get alarm details." });
  }
};


export {
  getAlarmDetails
};

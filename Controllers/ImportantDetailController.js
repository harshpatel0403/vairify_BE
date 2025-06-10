import ImportantDetail from "../Models/ImportantDetailModal.js";

export const getAllImportantDetails = async (req, res) => {
    try {
        const details = await ImportantDetail.find();
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching important details.' });
    }
};

export const createImportantDetail = async (req, res) => {
    const { name, value } = req.body;

    try {
        const newDetail = new ImportantDetail({
            value,
        });

        const savedDetail = await newDetail.save();

        res.status(201).json(savedDetail);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the important detail.' });
    }
};


export const updateImportantDetail = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    try {
        const updatedDetail = await ImportantDetail.findByIdAndUpdate(
            id,
            { value },
            { new: true }
        );

        if (!updatedDetail) {
            return res.status(404).json({ error: 'Important detail not found.' });
        }

        res.status(200).json(updatedDetail);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the important detail.' });
    }
};
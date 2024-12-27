import GRTTokenPackage from "../Models/GrtPackage.js"

export const createGRTPackage = async (req, res) => {
    const { name, price, totalTokens } = req.body;

    try {
        const newPackage = new GRTTokenPackage({
            name,
            price,
            totalTokens,
        });

        const savedPackage = await newPackage.save();

        res.status(201).json(savedPackage);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the GRT token package.' });
    }
};

export const getAllGRTPackages = async (req, res) => {
    try {
        const packages = await GRTTokenPackage.find();

        res.status(200).json(packages);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching GRT token packages.' });
    }
};

export const deleteGRTPackage = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPackage = await GRTTokenPackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({ error: 'GRT token package not found.' });
        }

        res.status(200).json({ message: 'GRT token package deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the GRT token package.' });
    }
};
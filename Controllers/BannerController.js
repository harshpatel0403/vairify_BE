import Banner from "../Models/BannersModal.js";

export const createBanner = async (req, res) => {
    try {
        const { bannerImage, bannerName, bannerLink, creatorUserId } = req.body;
        console.log(req.body)
        const newBanner = new Banner({
            bannerImage,
            bannerName,
            bannerLink,
            creatorUserId,
        });

        await newBanner.save();

        return res.json({
            message: 'Banner created successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getBannersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const banners = await Banner.find({ creatorUserId: userId });

        return res.json(banners);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


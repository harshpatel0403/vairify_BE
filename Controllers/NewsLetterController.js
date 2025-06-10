import NewsLetter from "../Models/NewsletterModal.js";

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
       
        const newsletter = new NewsLetter({
            email,
        });

        await newsletter.save();

        return res.json({
            message: 'Subscribed successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

 

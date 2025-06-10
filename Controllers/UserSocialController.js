import UserSocial from "../Models/UserSocials.js";

export const getUserSocials = async (req, res) => {
	const { userId } = req.params;

	try {
		const usersocail = await UserSocial.findOne({ userId });

		if (!usersocail) {
			return res
				.status(200)
				.json([{ message: "User socials information not found." }]);
		}

		const socialApps = usersocail.socialApp;

		return res.json(socialApps);
	} catch (error) {
		console.error(error);
		res.status(500).json(error);
	}
};

export const addUserSocial = async (req, res) => {
    try {
      const { userId, socialAppName, socialUrl } = req.body;
      const userSocial = await UserSocial.findOneAndUpdate(
        { userId },
        {
          $push: {
            socialApp: { socialAppName, socialUrl }
          }
        },
        { upsert: true, new: true }
      );
  
      res.status(200).json({ userSocial });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
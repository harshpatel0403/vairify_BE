import moment from "moment";
import Country from "../Models/Countries.js";

export const getAllCountries = async (req, res) => {
	try {
		const countries = await Country.find();
		res.status(200).json(countries);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching countries.",
		});
	}
};

export const createCountry = async (req, res) => {
	
	try {
		let image = null;
		if (req.file) {
			image  = req.file.originalname.replace(/ /g, "");
			
		}

		const country = new Country({
			name: req.body.name,
			image: req.file.originalname.replace(/ /g, ""),
		});
		await country.save();
		res.send("country created successfully");
	} catch (err) {
		res.status(500).send(err);
	}
};

export const updateCountryStatus = async (req, res) => {
	const { id } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		// Toggle the status
		country.status = !country.status;

		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while updating country status.",
		});
	}
};

export const deleteCountry = async (req, res) => {
	const { id } = req.params;

	try {
		const deletedCountry = await Country.findByIdAndRemove(id);

		if (!deletedCountry) {
			return res.status(404).json({ error: "Country not found." });
		}

		res.status(200).json({ message: "Country deleted successfully." });
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while deleting the country.",
		});
	}
};

export const addLanguageToCountry = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	try {
		let image = "";
		if (req.file) {
			const originalname = req.file.originalname.replace(/ /g, ""); // Remove spaces

			image = originalname;
		}
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const newLanguage = { name, image }; // Create a new language object
		country.languages.push(newLanguage); // Add the language object to the array

		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding language to the country.",
		});
	}
};

export const getLanguagesForCountry = async (req, res) => {
	const { id } = req.params;
	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const languages = country.languages; // Retrieve languages array from the country

		res.status(200).json(languages);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching languages for the country.",
		});
	}
};

export const deleteLanguageFromCountry = async (req, res) => {
	const { id, languageId } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const languageIndex = country.languages.findIndex(
			lang => lang._id.toString() === languageId,
		);

		if (languageIndex === -1) {
			return res
				.status(404)
				.json({ error: "Language not found in country." });
		}

		country.languages.splice(languageIndex, 1); // Remove the language
		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while deleting the language from the country.",
		});
	}
};

export const addCityToCountry = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		country.cities.push({ name }); // Add the city object to the array
		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding city to the country.",
		});
	}
};

export const getCitiesForCountry = async (req, res) => {
	const { id } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const cities = country.cities;

		res.status(200).json(cities);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching cities for the country.",
		});
	}
};

export const deleteCityFromCountry = async (req, res) => {
	const { id, cityId } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const cityIndex = country.cities.findIndex(
			city => city._id.toString() === cityId,
		);

		if (cityIndex === -1) {
			return res
				.status(404)
				.json({ error: "City not found in country." });
		}

		country.cities.splice(cityIndex, 1); // Remove the city
		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while deleting the city from the country.",
		});
	}
};

export const addVaripayToCountry = async (req, res) => {
	const { id } = req.params;
	const { name, link } = req.body;
	try {
		var image = "";
		if (req.file) {
			const timestamp = moment().format("YYYYMMDDHHmmss");
			const originalname = req.file.originalname.replace(/ /g, ""); // Remove spaces

			image = `${timestamp}-${originalname}`;
		}
		console.log("iamge detaiks: ", image)
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const newVaripay = { name, image, link };
		country.varipays.push(newVaripay);

		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding language to the country.",
		});
	}
};

export const getVaripaysForCountry = async (req, res) => {
	const { id } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const varipays = country.varipays;

		res.status(200).json(varipays);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching varipays for the country.",
		});
	}
};

export const deleteVaripayFromCountry = async (req, res) => {
	const { id, varipayId } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const varipayIndex = country.varipays.findIndex(
			varipay => varipay._id.toString() === varipayId,
		);

		if (varipayIndex === -1) {
			return res
				.status(404)
				.json({ error: "Varipay not found in country." });
		}

		country.varipays.splice(varipayIndex, 1);
		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while deleting the varipay from the country.",
		});
	}
};

export const addSocialToCountry = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	try {
		var image = "";
		if (req.file) {
			const originalname = req.file.originalname.replace(/ /g, ""); // Remove spaces
			image = originalname;
		}
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const newSocial = { name, image };
		country.social.push(newSocial);

		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while adding social to the country.",
		});
	}
};

export const getSocailForCountry = async (req, res) => {
	const { id } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const social = country.social;

		res.status(200).json(social);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while fetching social for the country.",
		});
	}
};

export const deleteSocialFromCountry = async (req, res) => {
	const { id, socialId } = req.params;

	try {
		const country = await Country.findById(id);

		if (!country) {
			return res.status(404).json({ error: "Country not found." });
		}

		const socialIndex = country.social.findIndex(
			soc => soc._id.toString() === socialId,
		);

		if (socialIndex === -1) {
			return res
				.status(404)
				.json({ error: "Social not found in country." });
		}

		country.social.splice(socialIndex, 1);
		const updatedCountry = await country.save();

		res.status(200).json(updatedCountry);
	} catch (error) {
		res.status(500).json({
			error: "An error occurred while deleting the social from the country.",
		});
	}
};

export const getAllLanguages = async (req, res) => {
	try {
		const countries = await Country.find();

		const uniqueLanguageNames = new Set();

		const uniqueLanguages = countries.flatMap(country =>
			country.languages.filter(language => {
				const isUnique = !uniqueLanguageNames.has(language.name);
				if (isUnique) {
					uniqueLanguageNames.add(language.name);
				}
				return isUnique;
			}),
		);

		res.json(uniqueLanguages);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error" });
	}
};

// src/controllers/authorControllers.js
import { 
    createAuthorService, 
    getAuthorService, 
    updateVerificationAuthorService,
    getAuthorByUserId,
    editAuthorProfileService,
    getAuthorDataService
    
} from "../services/authorServices.js";


export const createAuthor = async (req, res) => {
    try {
        const authorData = req.body;
        const author = await createAuthorService(authorData);
        res.status(201).send({
            data: author,
            message: "Create author success",
        });
    } catch (error) {
        res.status(500).send({
            message: "Failed to create author",
            error: error.message,
        });
    }
};

export const editAuthor = async (req, res) => {
    try {
        const authorData = req.body;
        const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
        const updatedAuthor = await editAuthorService(token, authorData);
        res.status(200).send({
            data: updatedAuthor,
            message: "Edit author success",
        });
    } catch (error) {
        res.status(500).send({
            message: "Failed to edit author",
            error: error.message,
        });
    }
};

export const getAuthor = async (req, res) => { 
    try {
        const authors = await getAuthorService();
        res.status(200).send({
            data: authors,
            message: "Get author success",
        });
    } catch (error) {
        res.status(500).send({
            message: "Failed to get author",
            error: error.message,
        });
    }
};

export const editVerifiedAuthor = async (req, res) => {
    try {
        const authorData = req.body;
        const { id } = req.params;
        const author = await updateVerificationAuthorService(id, authorData);
        res.status(200).send({
            data: author,
            message: "Edit author success",
        });
    } catch (error) {
        res.status(500).send({
            message: "Failed to edit author",
            error: error.message,
        });
    }
};


export const getAuthorProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
        const authorProfile = await getAuthorByUserId(token);
        res.status(200).json(authorProfile);
    } catch (error) {
        console.error("Error in getAuthorProfile:", error);
        res.status(500).json({ message: "Failed to retrieve author profile", error: error.message });
    }
};




export const editAuthorProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { firstName, lastName, email, password } = req.body;
        const file = req.file; // Asumsi menggunakan multer untuk handle file upload

        const profileData = {
            firstName,
            lastName,
            email,
            password: password || undefined // Hanya kirim password jika ada
        };

        const updatedAuthor = await editAuthorProfileService(token, profileData, file);

        res.status(200).json({
            message: 'Profile updated successfully',
            data: updatedAuthor
        });
    } catch (error) {
        console.error('Error in editAuthorProfileController:', error);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message
        });
    }
};
// backend/src/controllers/authorControllers.js


export const getAuthorData = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
    const authorData = await getAuthorDataService(token);
    res.json(authorData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching author data', error: error.message });
  }
};
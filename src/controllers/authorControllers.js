// src/controllers/authorControllers.js
import { 
    createAuthorService, 
    editAuthorService, 
    getAuthorService, 
    updateVerificationAuthorService 
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
        const { id } = req.params;
        const author = await editAuthorService(id, authorData);
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

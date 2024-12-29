// src/controllers/authorControllers.js
import {
  createAuthorService,
  getAuthorService,
  updateVerificationAuthorService,
  getAuthorByUserId,
  editAuthorProfileService,
  getAuthorDataService,
  getNewestTestsByAuthorService,
  getPopularTestsByAuthorService,
  searchTestsByTitleService,
  getAuthorById,
  publishTestService,
  deleteTestService
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
    const token = req.headers.authorization.split(" ")[1]; 
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
    const token = req.headers.authorization.split(" ")[1]; 
    const authorProfile = await getAuthorByUserId(token);
    res.status(200).json(authorProfile);
  } catch (error) {
    console.error("Error in getAuthorProfile:", error);
    res.status(500).json({
      message: "Failed to retrieve author profile",
      error: error.message,
    });
  }
};

export const editAuthorProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const { firstName, lastName, email, password } = req.body;
    const file = req.file; 

    const profileData = {
      firstName,
      lastName,
      email,
      password: password || undefined, 
    };

    const updatedAuthor = await editAuthorProfileService(
      token,
      profileData,
      file
    );

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedAuthor,
    });
  } catch (error) {
    console.error("Error in editAuthorProfileController:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getAuthorData = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const authorData = await getAuthorDataService(token);
    res.json(authorData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching author data", error: error.message });
  }
};

export const getNewestTestsByAuthorController = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const tests = await getNewestTestsByAuthorService(token);

    res.status(200).json({
      success: true,
      message: "Tests retrieved successfully",
      data: tests,
    });
  } catch (error) {
    console.error("Error in getTestsByAuthorController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tests",
    });
  }
};

export const getPopularTestsByAuthorController = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const tests = await getPopularTestsByAuthorService(token);

    res.status(200).json({
      success: true,
      message: "Tests retrieved successfully",
      data: tests,
    });
  } catch (error) {
    console.error("Error in getTestsByAuthorController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tests",
    });
  }
};

export const searchTestsByTitleController = async (req, res) => {
  try {
    const { title } = req.query;
    const token = req.headers.authorization.split(" ")[1];

    const tests = await searchTestsByTitleService(title, token);

    res.status(200).json({
      success: true,
      message: "Tests retrieved successfully",
      data: tests,
    });
  } catch (error) {
    console.error("Error in searchTestsByTitleController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tests",
    });
  }
};

export const fetchAuthorById = async (req, res) => {
  try {
    const userId = req.user.id
    console.log('Received userId from token:', userId)

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      })
    }

    const author = await getAuthorById(userId)

    res.status(200).json({
      success: true,
      data: author
    })
  } catch (error) {
    console.error('Error in fetchCurrentAuthor:', error)
    
    if (error.message === 'Author not found') {
      return res.status(404).json({ 
        success: false, 
        message: 'Author not found for this user' 
      })
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

export const publishTestController = async (req, res) => {
  try {
    const { id } = req.params; 
    const result = await publishTestService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in publishTestController:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestController = async (req, res) => {
  try {
    const { id } = req.params; 
    const result = await deleteTestService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteTestController:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
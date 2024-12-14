import { getTopScoresService } from '../services/leaderboardServices.js';

export const getTopScores = async (req, res) => {
  const { testId } = req.params;

  if (!testId) {
    return res.status(400).json({
      message: "Test ID is required",
    });
  }

  try {
    const topScores = await getTopScoresService(testId);
    
    res.status(200).json({
      message: "Top scores retrieved successfully",
      data: topScores
    });
  } catch (error) {
    console.error("Error in getTopScores controller:", error);
    res.status(500).json({
      message: "Failed to retrieve top scores",
      error: error.message
    });
  }
};
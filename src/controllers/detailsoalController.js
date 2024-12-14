import TestService from '../services/detailsoalServices.js';

const getTestDetails = async (req, res) => {
  const testId = req.params.testId;

  try {
    const testDetails = await TestService.getTestDetails(testId);
    res.status(200).json(testDetails);
  } catch (error) {
    res.status(404).json({ error: 'Test not found' });
  }
};

const TestController = {
  getTestDetails,
};

export default TestController;

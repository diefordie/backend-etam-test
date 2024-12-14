import { getWorktimeByTestId } from '../services/timerServices.js';

export async function getWorktime(req, res) {
  const { testId } = req.params; 

  try {
    const worktime = await getWorktimeByTestId(testId);
    res.status(200).json(worktime);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

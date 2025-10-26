import axios from 'axios';

const ML_URL = process.env.ML_URL || 'http://localhost:5001/evaluate';

export async function evaluateSession(payload) {
  try {
    const res = await axios.post(ML_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    // Bubble up a helpful error
    const message = err.response?.data || err.message || 'ML service request failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

const db = require('../dbhelper'); // adjust path as needed

const verifyAPIKeyAndToken = async (req, res, next) => {
  const { apiKey, apiToken } = req.body;

  if (!apiKey || !apiToken) {
    return res.status(400).json({ error: 'apiKey and apiToken are required' });
  }

  try {
    // Step 1: First check if apiKey + apiToken exist regardless of is_enabled
    const allMatchQuery = `
      SELECT spid, is_enabled FROM UserAPIKeys 
      WHERE api_key = ? AND api_token = ?
    `;
    const result = await db.excuteQuery(allMatchQuery, [apiKey, apiToken]);

    if (!result || result.length === 0) {
      return res.status(401).json({ error: 'Invalid API key or token' });
    }

    const record = result[0];
    if (record.is_enabled !== 1) {
      return res.status(403).json({ error: 'API key is currently disabled' });
    }

    // ✅ Attach spid to request for controller access
    req.spid = record.spid;
    next(); // proceed to next handler
  } catch (error) {
    console.error('API key validation error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = verifyAPIKeyAndToken;
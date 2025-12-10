// Portfolio API Endpoint
// Retrieves user's portfolio holdings from Upstox
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access token is required'
      });
    }
    
    // Fetch portfolio from Upstox API
    const portfolioResponse = await fetch('https://api.upstox.com/v2/portfolio/long-term-holdings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const portfolioData = await portfolioResponse.json();
    
    if (portfolioResponse.ok && portfolioData.status === 'success') {
      return res.status(200).json({
        success: true,
        data: portfolioData.data,
        message: 'Portfolio data retrieved successfully'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Failed to fetch portfolio',
        message: portfolioData.errors?.[0]?.message || 'Portfolio API error'
      });
    }
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Portfolio retrieval failed',
      message: error.message
    });
  }
};

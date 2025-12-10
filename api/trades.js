// Trades/Orders API Endpoint
// Retrieves user's order history from Upstox
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
    
    // Fetch order history from Upstox API
    const ordersResponse = await fetch('https://api.upstox.com/v2/order/retrieve-all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const ordersData = await ordersResponse.json();
    
    if (ordersResponse.ok && ordersData.status === 'success') {
      return res.status(200).json({
        success: true,
        data: ordersData.data,
        message: 'Orders data retrieved successfully'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Failed to fetch orders',
        message: ordersData.errors?.[0]?.message || 'Orders API error'
      });
    }
  } catch (error) {
    console.error('Trades error:', error);
    res.status(500).json({
      success: false,
      error: 'Trades retrieval failed',
      message: error.message
    });
  }
};

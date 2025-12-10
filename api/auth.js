// Upstox OAuth2 Authentication Handler
// Handles: OAuth URL generation and token exchange

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // OAuth Callback - User returning from Upstox with authorization code
    if (req.query.code) {
      const authCode = req.query.code;
      const CLIENT_ID = process.env.UPSTOX_CLIENT_ID;
      const CLIENT_SECRET = process.env.UPSTOX_CLIENT_SECRET;
      const REDIRECT_URI = `${process.env.REDIRECT_URI || 'https://soorya-trading-api.vercel.app'}/api/auth`;

      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.upstox.com/v2/login/authorization/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            code: authCode,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          // Success - Redirect to frontend with token
          const frontendURL = process.env.FRONTEND_URL || 'https://surenholkar9-maker.github.io/soorya-trading';
          return res.redirect(`${frontendURL}?access_token=${tokenData.access_token}&status=success`);
        } else {
          // Token exchange failed
          const frontendURL = process.env.FRONTEND_URL || 'https://surenholkar9-maker.github.io/soorya-trading';
          return res.redirect(`${frontendURL}?error=${encodeURIComponent(tokenData.error || 'Token exchange failed')}`);
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        const frontendURL = process.env.FRONTEND_URL || 'https://surenholkar9-maker.github.io/soorya-trading';
        return res.redirect(`${frontendURL}?error=${encodeURIComponent(error.message)}`);
      }
    }

    // Generate OAuth Authorization URL
    const CLIENT_ID = process.env.UPSTOX_CLIENT_ID;
    const REDIRECT_URI = `${process.env.REDIRECT_URI || 'https://soorya-trading-api.vercel.app'}/api/auth`;

    const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    res.json({
      success: true,
      authUrl: authUrl,
      message: 'OAuth authorization URL generated'
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

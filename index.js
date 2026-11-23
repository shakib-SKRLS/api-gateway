const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use(limiter);

app.use('/bookingservice', async (req, res, next) => {

  try{
     const response = await axios.get(`${AUTH_SERVICE_URL}/api/v1/isauthenticated`, {
    headers: {
      'x-access-token': req.headers['x-access-token']
    }

  });
  console.log(response.data);

  // NOTE: Auth_SERVICE spells this field "sucess" (not "success").
  // Keep this spelling until the auth service is fixed, and fix both sides together.
  if(response.data.sucess){
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' }); 
  }

  } catch (error) {
    
    return res.status(401).json({ error: 'Unauthorized' }); 
  }

 

 
});

app.use(morgan('combined'));
app.use('/bookingservice', createProxyMiddleware({
  target: BOOKING_SERVICE_URL,
  changeOrigin: true,
  // Strip the /bookingservice prefix: the booking service mounts its routes at /api,
  // so without this it would receive /bookingservice/api/v1/bookings and return 404.
  pathRewrite: { '^/bookingservice': '' },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Booking service unavailable' });
    }
  }
}));

const PORT = process.env.PORT || 3006;
app.get('/', (req, res) => {
  res.send('Welcome to the Booking Service Proxy!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

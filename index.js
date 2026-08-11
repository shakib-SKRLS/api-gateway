const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use(limiter);

app.use('/bookingservice', async (req, res, next) => {
  console.log(req.headers['x-access-token']);

  try{
     const response = await axios.get('http://localhost:3000/api/v1/isauthenticated', {
    headers: {
      'x-access-token': req.headers['x-access-token']
    }

  });
  console.log(response.data);

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
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002/', changeOrigin: true }));

const PORT = process.env.PORT || 3006;
app.get('/', (req, res) => {
  res.send('Welcome to the Booking Service Proxy!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
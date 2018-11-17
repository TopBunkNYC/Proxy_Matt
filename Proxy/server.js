const express = require('express');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios');
const parser = require('body-parser');
const app = express();
const port = 7001;

app.use(parser.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/public')));

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Add DAVID's API endpoints
app.get('/listingdata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`http://3.16.89.66/listingdata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/neighborhooddata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`http://3.16.89.66/neighborhooddata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/landmarkdata', (req, res) => {
  let lat = req.query.listingLat;
  let long = req.query.listingLong;
  axios.get(`http://3.16.89.66/landmarkdata?listingLat=${lat}&listingLong=${long}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

// Add STACY's API endpoints
app.get('/ratings', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      // console.log(results.data);
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/reviews', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      // console.log(results.data);
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

app.get('/search', (req, res) => {
  axios.get(`http://18.218.27.164${req.url}`)
    .then((results) => {
      // console.log(results.data);
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Add Dev's API endpoints
app.get('/description', (req, res) => {
  axios.get(`http://localhost:7000${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Add Louis's API endpoints
app.get('/bookinglisting/:id', (req, res)=>{ 
  let id = req.params.id;
  axios.get(`http://18.216.104.91/bookinglisting/${id}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});

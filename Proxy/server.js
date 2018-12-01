const express = require('express');
const path = require('path');
const axios = require('axios');
const parser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const services = require('./services.js');
const components = {};
const app = express();
const port = 7001;

app.use(parser.json());
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

// download bundles
(() => {
  let serviceNames = ['Description'];
  serviceNames.forEach((service) => {
    let url = path.join(__dirname, `/public/bundles/${service}.js`);
    fs.access(url, (err) => {
      if (err) {
        fetch(services[service])
          .then(response => {
            const dest = fs.createWriteStream(url);
            response.body.pipe(dest);
            response.body.on('end', () => {
              setTimeout(() => {
                console.log('file written');
              }, 0);
            });
          });
      } else {
        console.log('file exists');
      }
    });
  });
})();

// download server bundles
(() => {
  let serviceNames = ['DescriptionServer'];
  serviceNames.forEach((service) => {
    let url = path.join(__dirname, `/public/bundles/${service}.js`);
    fs.access(url, (err) => {
      if (err) {
        fetch(services[service])
          .then(response => {
            const dest = fs.createWriteStream(url);
            response.body.pipe(dest);
            response.body.on('end', () => {
              setTimeout(() => {
                components[service] = require(url).default;
                console.log('file written');
              }, 1000);
            });
          });
      } else {
        components[service] = require(url).default;
        console.log('file exists');
      }
    });
  });
})();

app.get('/listings', function(req, res) {
  Promise.all([
    axios.get('http://localhost:7000/renderDescription', {
      params: {
        id: req.query.id
      }
    })
  ])
    .then((results) => {
      let htmls = [];
      let props = [];
      let flag = true;
      results.forEach(({data}) => {
        if (data.success === false) {
          flag = false;
        } else {
          htmls.push(data.ssr_html);
          props.push(data.props);
        }
      });
      if (flag) {
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>TopBunk</title>
            <link rel="stylesheet" type="text/css" href="/styles.css">
            <!-- <link rel="stylesheet" type="text/css" href="http://18.216.104.91/guestBar.css"> -->
            <!-- <link type="text/css" rel="stylesheet" href="http://18.218.27.164/style.css"> -->
            <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
          </head>
          <body>
            <div id="description">${htmls[0]}</div>
            <div class="container-left">
              <div id="reviews"></div>
              <div id="neighborhood"></div>
            </div>
            <div class=container-right>
              <div id="booking"></div>
            </div>
            <script crossorigin src="https://unpkg.com/react@16.6.3/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@16.6.3/umd/react-dom.development.js"></script>
            <script src="./bundles/Description.js"></script>
            <script>
              ReactDOM.hydrate(
                React.createElement(Description, ${props[0]}),
                document.getElementById('description')
              );
            </script>
          </body>
          </html>
        `);
      } else {
        res.status(404).send();
      }
    });
});

const loaderio = process.env.loaderio || require('./config.js').loader;
app.get(`/loaderio-${loaderio}`, (req, res) => {
	res.send(`loaderio-${loaderio}`);
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});

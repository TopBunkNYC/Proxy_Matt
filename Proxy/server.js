const express = require('express');
const path = require('path');
const axios = require('axios');
// const redis = require('redis');
const parser = require('body-parser');
const app = express();
const port = 7001;

// const client = redis.createClient({host: `${process.env.redis || require('./config.js').redis}`});

app.use(parser.json());
app.use(express.static(path.join(__dirname, '/public')));

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Add Neighborhood API endpoints
app.get('/listingdata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`${process.env.neighborhood || require('./config.js').neighborhood}/listingdata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/neighborhooddata', (req, res) => {
  let requestId = req.query.id;
  requestId = requestId.slice(-3) * 1;
  axios.get(`${process.env.neighborhood || require('./config.js').neighborhood}/neighborhooddata?id=${requestId}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

app.get('/landmarkdata', (req, res) => {
  let lat = req.query.listingLat;
  let long = req.query.listingLong;
  axios.get(`${process.env.neighborhood || require('./config.js').neighborhood}/landmarkdata?listingLat=${lat}&listingLong=${long}`)
    .then((results) => res.send(results.data))
    .catch((err) => console.error(err));
});

// Add Reviews API endpoints
app.get('/ratings', (req, res) => {
  axios.get(`${process.env.reviews || require('./config.js').reviews}${req.url}`)
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
  axios.get(`${process.env.reviews || require('./config.js').reviews}${req.url}`)
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
  axios.get(`${process.env.reviews || require('./config.js').reviews}${req.url}`)
    .then((results) => {
      // console.log(results.data);
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Add Description API endpoints
app.get('/description', (req, res) => {
  axios.get(`${process.env.description || require('./config.js').description}${req.url}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
      res.send();
    });
});

// Add Booking API endpoints
app.get('/bookinglisting/:id', (req, res)=>{ 
  let id = req.params.id;
  axios.get(`${process.env.booking || require('./config.js').booking}/bookinglisting/${id}`)
    .then((results) => {
      res.send(results.data);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get('/listings', function(req, res) {
  client.get(req.query.id, (err, result) => {
    if (err) {
      console.log(err);
    } else if (result) {
      res.send(result);
    } else {
      Promise.all([
        axios.get(`${process.env.description || require('./config.js').description}/renderDescription`, {
          params: {
            id: req.query.id
          },
          timeout: 10000
        })
          .catch((err) => {
            console.log(err);
          }),
        axios.get(`${process.env.reviews || require('./config.js').reviews}/renderReviews`, {
          params: {
            id: req.query.id
          },
          timeout: 10000
        })
          .catch((err) => {
            console.log(err);
          }),,
        axios.get(`${process.env.neighborhoodRender || require('./config.js').neighborhoodRender}/renderNeighbs`, {
          params: {
            id: req.query.id
          },
          timeout: 10000
        })
          .catch((err) => {
            console.log(err);
          }),,
        axios.get(`${process.env.booking || require('./config.js').booking}/renderBooking`, {
          params: {
            id: req.query.id
          },
          timeout: 10000
        })
          .catch((err) => {
            console.log(err);
          }),
      ])
        .then((results) => {
          let htmls = [];
          let props = [];
          let flag = true;
          results.forEach((results) => {
            console.log(results);
            let data;
            if (results === undefined) {
              data = {ssr_html: '<div></div>', props: undefined};
            } else {
              data = results.data;
            }
            if (data.success === false) {
              flag = false;
            } else {
              htmls.push(data.ssr_html);
              props.push(data.props);
            }
          });
          if (flag) {
            let template = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>TopBunk</title>
              <link rel="stylesheet" type="text/css" href="/styles.css">
              <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/guestBar.css">
              <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/flexboxgrid2.css">
              <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/_datepicker.css">
              <link type="text/css" rel="stylesheet" href="${process.env.reviews || require('./config.js').reviews}/style.css">
              <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
            </head>
            <body>
              <div class="container-left">
                <div id="description">${htmls[0]}</div>
                <div id="reviews">${htmls[1]}</div>
                <div id="neighborhood">${htmls[2]}</div>
              </div>
              <div class=container-right>
                <div id="booking">${htmls[3]}</div>
              </div>
              <script crossorigin src="https://unpkg.com/react@16.6.3/umd/react.development.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@16.6.3/umd/react-dom.development.js"></script>
              <script src="http://localhost:7000/bundle.js"></script>
              <script src="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/client-bundle.js"></script>
              <script src="${process.env.neighborhood || require('./config.js').neighborhood}/app.js"></script>
              <script src="https://s3.amazonaws.com/topbunk/bundle.js"></script>
              <script>
                ReactDOM.hydrate(
                  React.createElement(Description, ${props[0]}),
                  document.getElementById('description')
                );
              </script>
              <script>
                ReactDOM.hydrate(
                  React.createElement(Reviews, ${props[1]}),
                  document.getElementById('reviews')
                );
              </script>
              <script>
                ReactDOM.hydrate(
                  React.createElement(Neighborhood, ${props[2]}),
                  document.getElementById('neighborhood')
                );
              </script>
              <script>
                ReactDOM.hydrate(
                  React.createElement(Booking, ${JSON.stringify(props[3])}),
                  document.getElementById('booking')
                );
              </script>
            </body>
            </html>
            `;
            client.set(req.query.id, template);
            res.send(template);
          } else {
            res.status(404).send();
          }
        });
    }
  });
  // Promise.all([
  //   axios.get(`${process.env.description || require('./config.js').description}/renderDescription`, {
  //     params: {
  //       id: req.query.id
  //     },
  //     timeout: 10000
  //   })
  //     .catch((err) => {
  //       console.log(err);
  //     }),
  //   axios.get(`${process.env.reviews || require('./config.js').reviews}/renderReviews`, {
  //     params: {
  //       id: req.query.id
  //     },
  //     timeout: 10000
  //   })
  //     .catch((err) => {
  //       console.log(err);
  //     }),,
  //   axios.get(`${process.env.neighborhoodRender || require('./config.js').neighborhoodRender}/renderNeighbs`, {
  //     params: {
  //       id: req.query.id
  //     },
  //     timeout: 10000
  //   })
  //     .catch((err) => {
  //       console.log(err);
  //     }),,
  //   axios.get(`${process.env.booking || require('./config.js').booking}/renderBooking`, {
  //     params: {
  //       id: req.query.id
  //     },
  //     timeout: 10000
  //   })
  //     .catch((err) => {
  //       console.log(err);
  //     }),
  // ])
  //   .then((results) => {
  //     let htmls = [];
  //     let props = [];
  //     let flag = true;
  //     results.forEach((results) => {
  //       console.log(results);
  //       let data;
  //       if (results === undefined) {
  //         data = {ssr_html: '<div></div>', props: undefined};
  //       } else {
  //         data = results.data;
  //       }
  //       if (data.success === false) {
  //         flag = false;
  //       } else {
  //         htmls.push(data.ssr_html);
  //         props.push(data.props);
  //       }
  //     });
  //     if (flag) {
  //       res.end(`
  //         <!DOCTYPE html>
  //         <html lang="en">
  //         <head>
  //           <meta charset="UTF-8">
  //           <title>TopBunk</title>
  //           <link rel="stylesheet" type="text/css" href="/styles.css">
  //           <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/guestBar.css">
  //           <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/flexboxgrid2.css">
  //           <link rel="stylesheet" type="text/css" href="${process.env.booking || require('./config.js').booking}/_datepicker.css">
  //           <link type="text/css" rel="stylesheet" href="${process.env.reviews || require('./config.js').reviews}/style.css">
  //           <link rel="icon" type="image/png" href="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/favicon.ico">
  //         </head>
  //         <body>
  //           <div class="container-left">
  //             <div id="description">${htmls[0]}</div>
  //             <div id="reviews">${htmls[1]}</div>
  //             <div id="neighborhood">${htmls[2]}</div>
  //           </div>
  //           <div class=container-right>
  //             <div id="booking">${htmls[3]}</div>
  //           </div>
  //           <script crossorigin src="https://unpkg.com/react@16.6.3/umd/react.development.js"></script>
  //           <script crossorigin src="https://unpkg.com/react-dom@16.6.3/umd/react-dom.development.js"></script>
  //           <script src="https://s3.amazonaws.com/topbunk-nyc-description/bundle.js"></script>
  //           <script src="https://s3.us-east-2.amazonaws.com/topbunk-profilephotos/client-bundle.js"></script>
  //           <script src="${process.env.neighborhood || require('./config.js').neighborhood}/app.js"></script>
  //           <script src="https://s3.amazonaws.com/topbunk/bundle.js"></script>
  //           <script>
  //             ReactDOM.hydrate(
  //               React.createElement(Description, ${props[0]}),
  //               document.getElementById('description')
  //             );
  //           </script>
  //           <script>
  //             ReactDOM.hydrate(
  //               React.createElement(Reviews, ${props[1]}),
  //               document.getElementById('reviews')
  //             );
  //           </script>
  //           <script>
  //             ReactDOM.hydrate(
  //               React.createElement(Neighborhood, ${props[2]}),
  //               document.getElementById('neighborhood')
  //             );
  //           </script>
  //           <script>
  //             ReactDOM.hydrate(
  //               React.createElement(Booking, ${JSON.stringify(props[3])}),
  //               document.getElementById('booking')
  //             );
  //           </script>
  //         </body>
  //         </html>
  //       `);
  //     } else {
  //       res.status(404).send();
  //     }
  //   });
});

const loaderio = process.env.loaderio || require('./config.js').loader;
app.get(`/loaderio-${loaderio}`, (req, res) => {
	res.send(`loaderio-${loaderio}`);
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});

# Proxy Server
This server requests SSR data from the individual microservices of the application and combines them into an HTML that is then sent to the client. It also talks to a Redis cache to reduce latency and demand to microservices when high-trafficked listings are requested.

<img src="https://github.com/TopBunkNYC/Proxy_Matt/blob/master/TopBunkGIF1.gif" width="65%" height="65%">
<img src="https://github.com/TopBunkNYC/Proxy_Matt/blob/master/TopBunkGIF2.gif" width="65%" height="65%">

## Microservices

  - https://github.com/TopBunkNYC/Description
  - https://github.com/TopBunkNYC/Neighborhood
  - https://github.com/TopBunkNYC/Booking
  - https://github.com/TopBunkNYC/Reviews

## Development

### Setting up microservices
Before this proxy server can be run, each microservice above needs to be set up and running. You can follow the instructions at the links above to set these up. Additionally, a Redis database needs to be set up for caching purposes. 

### Setting up `config.js`
A `config.js` file needs to be created and added to the root directory. This file should export an object containing the following keys: `description`, `neighborhood`, `booking`, `reviews`, and `redis`, whose values correspond to the ip address of the microservice/database.

```sh
module.exports = {
  description: 'description-ip-address',
  neighborhood: 'neighborhood-ip-address',
  booking: 'booking-ip-address',
  reviews: 'reviews-ip-address',
  redis: 'redis-database-host-address'
}
```

### Launching the application locally
From within the root directory:

```sh
# download dependencies
npm install

# start server on localhost
npm run server-node
```

Then access the application at: http://localhost:7001/listings?id=#, replacing # with any number from 1 to 10M, corresponding to the listing ID. For example, listing 5465 would be http://localhost:7001/listing?id=5465.

# **Configrouter**

#### Flexible router for quickly building/testing web services. Built atop the powerful [router-parser](https://github.com/rcs/route-parser).

## Installation

> npm install configrouter

## Usage

First import the module into your code.

```js
let ConfigRouter = require('configrouter');
```

Then define your routes following this simple schema.

```
handler = Function(req, res, params)

Object {
  String httpMethod1: Object {
    String /route1: handler,  //optional
    String /route2: handler,  //optional
    String /noMatch: handler  //required
  },
}
```

Example:

```js
let myHandler = (req, res, params) => {
  if (params.number === '42') {
    res.end('Hello World');
  }
};

let routes = {
  'GET': {
    '/': myHandler,
    '/:number': myHandler,
    'notFound': (req, res) => {
      //Handle request
    },
  },
  'POST': {
    'notFound': (req, res) => {
      //Handle request
    },
  },
```

Routes resolve in insertion order. In the case of duplicate entries, the latter route wins.

Best practice is to define your routes in a separate file and import it into your server.

```js
  const ConfigRouter = require('configrouter');
  const routes = require('path/to/routes.js')

  let router = new ConfigRouter(routes);

  let server = http.createServer((req, res) => {
    router.route(req, res);
  });
```

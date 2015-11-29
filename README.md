# **Configrouter**

### Flexible router for quickly building web services. Built atop the powerful [router-parser](https://github.com/rcs/route-parser).

## Installation

> npm install configrouter

## Usage

#### First import the module into your code.

```js
let ConfigRouter = require('configrouter');
```

#### Then follow this schema.

```
 Object {
  String httpMethod1: Object {
    Optional String route1: Function handler<req, res, params>,
    Optional String route2: Function handler<req, res, params>,
    Required String 'default': handler
    Required String 'notFound': handler
  },
  etc...
}
```

#### Here is an example.

```js
let myHandler = (req, res, params) => res.end('Hello World');

let routes = {
  'GET': {
    '/path/:with/params': myHandler,
    'default': (req, res, params) {
      //Handle request
    },
    'notFound': (req, res, params) {
      //Handle request
    },
  },
  'PUT': {
    //etc
  },
```

#### Routes much be unique to the method it is defined under. Each parent HTTP method must contain a "default" and "notFound" route and handler.

#### Finally create and call the Router

```js
  let Router = new ConfigRouter();

  Router.init(routes);

  //Server goes here
  Router.route(req, res)
```

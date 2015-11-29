'use strict';

let Url = require('url');
let RouteParser = require('../node_modules/route-parser/index.js');
//let Catcher = require('./Catcher.js');

function Router() {}
Router.prototype.router = undefined;
Router.prototype.pathList = undefined;
/** Parse route */
Router.prototype.init = function(routes) {
  if (!routes) {
    throw new Error('Please provide a route configuration');
  }

  let methods = Object.keys(routes);
  let router = new Map();
  let pathList = [];

  methods.forEach((m) => {
    Object.keys(routes[m]).forEach((path) => {
      let parser = new RouteParser();
      let routeObj = {
          method: m,
          path: path,
          handler: routes[m][path],
          parser: undefined,
      };

      parser.create(path);
      routeObj.parser = parser;

      if (router.has(path)) {
        let temp = router.get(path);
        router.set(path, [temp, routeObj]);
      } else {
        router.set(path, routeObj);
      }

      //TODO Check for duplicates
      pathList.push({
        [m]: path
      });
    });
  });

  this.router = router;
  this.pathList = pathList;
};
Router.prototype.matchRoute = function(method, url) {
  //TODO Implement trie
  let params;
  let iter = this.router[Symbol.iterator]();
  let routeObj = iter.next().value;

  while (routeObj) {
    if (Array.isArray(routeObj[1])) {
      routeObj[1].forEach((o) => {

        if (o.method === method) {
          params = o.parser.match(url);
        }
      });
    } else {
      params = routeObj[1].parser.match(url);
    }

    if (params) break;
    routeObj = iter.next().value;
  }
  //console.log(routeObj, params);
  return {routeObj, params};
};
Router.prototype.validate = function(req, res) { };
Router.prototype.route = function(req, res) {
  let matchResult;

  //Check for route match
  matchResult = this.matchRoute(req.method, req.url);

  //Does it exist?
  //console.log(matchResult);
  if (matchResult.routeObj) {
    if (Array.isArray(matchResult.routeObj[1])) {
      for (let i of matchResult.routeObj[1]) {
        if (req.method === i.method) {
          i.handler(req, res, matchResult.params);
        }
      }
    } else {
      matchResult.routeObj[1].handler(req, res, matchResult.params);
    }
  } else if (typeof this.router.get('default')) {
    //Check for default handler
    /*
    console.log('________');
    console.log(this.router.get('default'));
    console.log('________');
    */

    this.finder(req, res, matchResult.params, 'default');
  } else if (typeof this.router.get('notFound')) {
    this.finder(req, res, matchResult.params, 'notFound');
  }// else { throw ('No appropiate route found'); }

};
Router.prototype.noMethodHandler = function (req, res, params) {
  //console.log('Not route found for this method');
  res.statusCode = 501;
  res.end();
};
Router.prototype.finder = function (req, res, params, selection) {
  //console.log(`Running ${selection} Case`);

  let route = this.router.get(selection);
  let isArray = Array.isArray(route);
  /*
  console.log('Route');
  console.log(route)
  console.log(req.method);
  console.log(selection);
  console.log('*********');
  */

  let a = () => {};

  if (isArray) {
    //console.log('In Array');

    for (let i of route) {
      if (i.method === req.method) {
        /*
        console.log(i);
        console.log('*!*!*!*!*!!*!*!*');
        */
        return i.handler(req, res, params);
      }
    }

    if (selection !== 'notFound') {
      this.finder(req, res, params, 'notFound');
    } else {
      this.noMethodHandler(req, res);
    }
  } else {
    //If methods doesn't match
    if (req.method === route.method) {
      route.handler(req, res, params);
    } else if (selection !== 'notFound') {
      return this.finder(req, res, params, 'notFound');
    } else {
      this.noMethodHandler(req, res);
    }
  }
};

module.exports = Router;

'use strict';

let url = require('url');
//let routeParser = require('../node_modules/route-parser/index.js');
let routeParser = require('route-parser');
let router = undefined;
let pathList = undefined;

/** Parse route */
function init(routes) {
  if (!routes) {
    throw new Error('Please provide a route configuration');
  }

  let methods = Object.keys(routes);
  let routerObject= new Map();
  let localPathList = [];

  methods.forEach((m) => {
    Object.keys(routes[m]).forEach((path) => {
      //let parser = new routeParser();
      let routeTemplate = {
          method: m,
          path: path,
          handler: routes[m][path],
          //parser: undefined,
          parser: new routeParser(path)
      };

      //parser.create(path);
      //routeObj.parser = parser;

      if (routerObject.has(path)) {
        let temp = routerObject.get(path);
        routerObject.set(path, [temp, routeTemplate]);
      } else {
        routerObject.set(path, routeTemplate);
      }

      //TODO Check for duplicates
      localPathList.push({
        [m]: path
      });
    });
  });

  //Modify state
  router = routerObject;
  pathList = localPathList;
}

function matchRoute(method, url) {
  //TODO Implement trie
  let params;
  let iter = router[Symbol.iterator]();
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
}

//function validate(req, res) { }
function route(req, res) {
  let matchResult;

  //Check for route match
  matchResult = matchRoute(req.method, req.url);


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
  } else if (typeof router.get('default')) {
    //Check for default handler
    /*
    console.log('________');
    console.log(router.get('default'));
    console.log('________');
    */

    finder(req, res, matchResult.params, 'default');
  } else if (typeof router.get('notFound')) {
    finder(req, res, matchResult.params, 'notFound');
  }// else { throw ('No appropiate route found'); }

}

function noMethodHandler(req, res, params) {
  //console.log('Not route found for this method');
  res.statusCode = 501;
  res.end();
}

function finder(req, res, params, selection) {
  //console.log(`Running ${selection} Case`);

  let route = router.get(selection);
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
      finder(req, res, params, 'notFound');
    } else {
      noMethodHandler(req, res);
    }
  } else {
    //If methods doesn't match
    if (req.method === route.method) {
      route.handler(req, res, params);
    } else if (selection !== 'notFound') {
      return finder(req, res, params, 'notFound');
    } else {
      noMethodHandler(req, res);
    }
  }
}

function getRouter() { return router; }
function getPathList() { return pathList; }

//let router = undefined;
//let pathList = undefined;
module.exports = {
  init,
  matchRoute,
  route,
  noMethodHandler,
  finder,
  //validate,
  getRouter,
  getPathList
};

'use strict';

const routeParser = require('route-parser');
let isArray = Array.isArray;

class ConfigRouter {
  constructor(routes) {
    if (!routes) {
      throw new Error('Please provide a route object');
    }

    let routerObject = new Map();

    let methods = Object.keys(routes);
    //let routerObject = new Map();
    let localPathList = [];
    let count = 0;

    while (count < methods.length) {
      let m = methods[count]; 
      let currentRoutes = Object.keys(routes[m]);
      this.checkRequiredRoutes(m, routes[m]);

      for (let path of currentRoutes) {
        let routeTemplate = {
          method: m,
          path: path,
          handler: routes[m][path],
          //parser: undefined,
          parser: new routeParser(path)
        };

        //Combine similar routes from different methods
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
      }

      count++;
    }

    //Modify state
    this.router = routerObject;
    this.pathList = localPathList;
  }

  checkRequiredRoutes(method, route) {
    if (!route['notFound']) {
      throw new Error(`'${method}' handler does not contain a required 'notFound' route`);
    }
  }

  matchRoute(method, url) {
    let params;
    let iter = this.router[Symbol.iterator]();
    let routeObj = iter.next().value;

    while (routeObj) {
      let route = routeObj[1];

      //Check all handlers under this route
      if (isArray(route)) {
        route.forEach((o) => {

          if (o.method === method) {
            params = o.parser.match(url);
          }
        });
      } else {
        params = route.parser.match(url);
      }

      if (params) 
        break;

      routeObj = iter.next().value;
    }

    return {
      routeObj, 
      params
    };
  }

  route(req, res) {
    let matchResult;

    //Check for route match
    matchResult = this.matchRoute(req.method, req.url);

    if (matchResult.routeObj) {
      let route = matchResult.routeObj[1];

      if (isArray(route)) {
        for (let i of route) {
          if (req.method === i.method) {
            i.handler(req, res, matchResult.params);
          }
        }
      }
      else {
        route.handler(req, res, matchResult.params);
      }
    }
    //else if (this.router.get('notFound'))
    else {
      this.finder(req, res, matchResult.params, 'notFound');
    }

  }

  noMethodHandler(req, res, params) {
    //console.log('Not route found for this method');
    res.statusCode = 501;
    res.end();
  }

  finder(req, res, params, selection) {
    let route = this.router.get(selection);

    if (isArray) {
      for (let i of route) {
        if (i.method === req.method) {
          return i.handler(req, res, params);
        }
      }

      if (selection !== 'notFound') {
        this.finder(req, res, params, 'notFound');
      }
      else {
        this.noMethodHandler(req, res);
      }
    } 
    else {
      //If methods doesn't match
      if (req.method === route.method) {
        route.handler(req, res, params);
      } 
      else if (selection !== 'notFound') {
        return this.finder(req, res, params, 'notFound');
      } 
      else {
        this.noMethodHandler(req, res);
      }
    }
  }
}

module.exports = ConfigRouter;

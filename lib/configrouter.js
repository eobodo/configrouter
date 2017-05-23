"use strict";

const routeParser = require("route-parser");
let isArray = Array.isArray;

let httpMethods = {
  GET: true,
  POST: true,
  PUT: true,
  HEAD: true,
  OPTIONS: true,
  CONNECT: true
};

class ConfigRouter {
  constructor(config) {
    this.router = new Map();
    this.routeList = [];

    if (!config) {
      throw new Error("Please provide a route object");
    }

    let routeMethods = Object.keys(config);
    let count = 0;

    while (count < routeMethods.length) {
      let method = routeMethods[count];
      let currentRouteList = Object.keys(config[method]);

      this.checkRequiredRoutes(method, config[method]);

      for (let route of currentRouteList) {
        let newRoute = {
          method: method,
          route: route,
          handler: config[method][route],
          parser: new routeParser(route),
          params: undefined
        };

        this.sanitizeRoutes(method, route);

        //Combine similar routes from different methods
        if (this.router.has(route) === true) {
          let prevRoute = this.router.get(route);

          //Check for duplicate route
          if (isArray(prevRoute) === true) {
            this.router.set(route, [...prevRoute, newRoute]);
          } else {
            this.router.set(route, [prevRoute, newRoute]);
          }
        } else {
          this.router.set(route, newRoute);
        }
      }

      count++;
    }
  }

  route(req, res) {
    let method = req.method;
    let url = req.url;
    let matchResult;

    //Check for route match
    matchResult = this.matchRoute(method, url);

    if (matchResult !== undefined) {
      matchResult.handler(req, res, matchResult.params);
    } else {
      this.routeFinder(req, res, undefined, "/noMatch");
    }
  }

  matchRoute(method, url) {
    let params;
    let routeObj;

    //Find matching route
    for (let candidate of this.router) {
      let path = candidate[0];
      let routes = candidate[1];
      let hasMatch = false;

      //Check all handlers under this route
      if (isArray(routes)) {
        for (let route of routes) {
          if (route.method === method) {
            params = route.parser.match(url);

            if (params !== false) {
              routeObj = route;
              routeObj["params"] = params;
              hasMatch = true;
              break;
            }
          }
        }
      } else {
        params = routes.parser.match(url);

        if (routes.method === method && params !== false) {
          routeObj = routes;
          routeObj["params"] = params;
          hasMatch = true;
          break;
        }
      }

      if (hasMatch === true) {
        break;
      }
    }

    return routeObj;
  }

  routeFinder(req, res, params, selection) {
    let method = req.method;
    let url = req.url;
    let route = this.router.get(selection);

    if (isArray(route)) {
      for (let r of route) {
        if (r.method === method) {
          return r.handler(req, res, params);
        }
      }
    } else {
      if (method === route.method) {
        return route.handler(req, res, params);
      }
    }

    this.noMethodHandler(req, res);
  }

  noMethodHandler(req, res, params) {
    res.statusCode = 501;
    res.end();
  }

  checkRequiredRoutes(method, route) {
    if (route["/noMatch"] === undefined) {
      throw new Error(
        `'${method}' method has not defined the required '/noMatch' route`
      );
    }
  }

  sanitizeRoutes(method, route) {
    if (httpMethods[method] !== true)
      throw new Error(`${method} is not a valid HTTP method`);

    if (route.search("^/") !== 0)
      throw new Error(
        `Route '${route}' defined under method ${method} must start with '/'`
      );
  }
}

module.exports = ConfigRouter;

"use strict";

const routeParser = require("route-parser");
let isArray = Array.isArray;

class ConfigRouter {
  constructor(routes) {
    if (!routes) {
      throw new Error("Please provide a route object");
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
    if (!route["notFound"]) {
      throw new Error(
        `'${method}' handler does not contain a required 'notFound' route`
      );
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
        route.forEach(o => {
          if (o.method === method) {
            params = o.parser.match(url);
          }
        });
      } else {
        params = route.parser.match(url);
      }

      if (params) break;

      routeObj = iter.next().value;
    }

    return {
      routeObj,
      params
    };
  }

  route(method, url, ctx) {
    let matchResult;

    //Check for route match
    matchResult = this.matchRoute(method, url);

    if (matchResult.routeObj) {
      let route = matchResult.routeObj[1];

      if (isArray(route)) {
        for (let r of route) {
          if (method === r.method) {
            r.handler(ctx, matchResult.params);
          }
        }
      } else {
        route.handler(ctx, matchResult.params);
      }
    } else {
      //else if (this.router.get('notFound'))
      this.finder(...arguments, matchResult.params, "notFound");
    }
  }

  noMethodHandler(ctx, params) {
    //console.log('Not route found for this method');
    ctx.res.statusCode = 501;
    ctx.res.end();
  }

  finder(method, url, ctx, params, selection) {
    let route = this.router.get(selection);

    if (isArray(route)) {
      for (let r of route) {
        if (r.method === method) {
          return r.handler(ctx, params);
        }
      }

      if (selection !== "notFound") {
        this.finder(method, url, ctx, params, "notFound");
      } else {
        this.noMethodHandler(ctx);
      }
    } else {
      //If methods doesn't match
      if (method === route.method) {
        route.handler(ctx, params);
      } else if (selection !== "notFound") {
        return this.finder(method, url, ctx, params, "notFound");
      } else {
        this.noMethodHandler(ctx);
      }
    }
  }
}

module.exports = ConfigRouter;

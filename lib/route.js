'use strict';
//For route parser

var Parser = require('./route/parser'),
    RegexpVisitor = require('./route/visitors/regexp'),
    ReverseVisitor = require('./route/visitors/reverse');

/**
* Create Router object with routes
* Parse routes into object literal
* Create Parser's from spec
* Attach route properties to Parser object
* Add to routeList
* Set routeList propery
* Match routes to by iterating through routeList
* Call handler on match with params provided
*/
function Route() { }
//Route.prototype.spec;
Route.prototype.ast;
Route.prototype.create = function (spec) {
  if (typeof spec === 'undefined') {
    throw new Error('route spec is required');
  }

  this.spec = spec;
  this.ast = Parser.parse(spec);
};
Route.prototype.match = function (path) {
    var re = RegexpVisitor.visit(this.ast),
        matched = re.match(path);
    //let length = path.length;
    /*for (let i = 0; i<length; i++) {
        RegexpVisitor.visit(this.ast),
          matched = re.match(path);
    }*/


    return matched ? matched : false;
};
Route.prototype.reverse = function (params) {
  return ReverseVisitor.visit(this.ast, params);
};

module.exports = Route;

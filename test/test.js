'use strict';

let Http = require('http');
let CoolRouter = require('../index.js');
let Router = new CoolRouter();
let expect = require('chai').expect;

let routes = {
  'GET': {
    '/': (req, res) => {
      res.end('Path: Get /');
    },
    'default': (req, res) => {
      res.end('Path: Get default');
    },
  },
  'PUT': {
    '/': (req, res) => {
      res.end('Path: Put /');
    },
    'default': (req, res) => {
      res.end('Path: Put default');
    },
  },
};

let reqList = []
let testData = [
  { method: 'GET', path: '/'},
  { method: 'GET', path: '/clean'},
  { method: 'PUT', path: '/'},
  { method: 'PUT', path: '/something'},
];

for (let m in testData) {
  reqList.push({
    hostname: 'localhost',
    port: '8080',
    method: testData[m].method,
    path: testData[m].path,
  });
}

Router.init(routes);

let server = Http.createServer((req, res) => {
  Router.route(req, res);
});

let tester = () => {
  for (let count = 0; count < reqList.length; count++) {
    Http.get(reqList[count]).on('response', (_req) => {
      _req.on('data', (body) => {
        console.log(body.toString());
        switch (count) {
          case 0:
            expect(body.toString()).to.equal('Path: Get /');
            break;
          case 1:
            expect(body.toString()).to.equal('Path: Get default');
            break;
          case 2:
            expect(body.toString()).to.equal('Path: Put /');
            break;
          case 3:
            expect(body.toString()).to.equal('Path: Put default');
            break;
          default:
        };
      });
    });
  }
  console.log('Hey');
  //server.close();
};

server.listen(8080, 'localhost', tester);

'use strict';

let http = require('http');
let Router = require('../index.js');
let expect = require('expect');

//Create routes
let routes = {
  'GET': {
    '/': (req, res, params) => {
      res.end('Path: At home');
    },
    '/clean': (req, res, params) => {
      res.end('Path: Got clean');
    },
    'notFound': (req, res, params) => {
      res.end('Path: Default route');
    },
  },
  'POST': {
    '/': (req, res, params) => {
      res.end('Path: Home Put');
    },
    'notFound': (req, res, parms) => {
      res.end('Path: Default Put');
    },
  },
};

//Create test requests
let reqList = [];
let testData = [
  { method: 'GET', path: '/'},
  { method: 'GET', path: '/clean'},
  { method: 'POST', path: '/'},
  { method: 'POST', path: '/something'},
];

for (let m in testData) {
  reqList.push({
    hostname: 'localhost',
    port: '8080',
    method: testData[m].method,
    path: testData[m].path,
  });
}

function testResponse(count, body) {
  switch (count) {
    case 0:
      expect(body).toBe('Path: At home');
    break;
    case 1:
      expect(body).toBe('Path: Got clean');
    break;
    case 2:
      expect(body).toBe('Path: Home Put');
    break;
    case 3:
      expect(body).toBe('Path: Default Put');
      console.log('Test completed successfully');
      server.close();
    break;
    /*
    default:
    break;
    */
  }
}

//Init router
let router = new Router(routes);

function startTestHook() {
  for (let count = 0; count < reqList.length; count++) {
    http.get(reqList[count], (pendingReq) => {
      
      //pendingReq.on('response', testResponse);
      pendingReq.on('data', (data) => {
        testResponse(count, data.toString());
      });
      //pendingReq.on('response', (res) => {console.log(res)});
    });
    //request.on('response', handleReq);
  }
}

//Init Server
let server = http.createServer((req, res) => {
  router.route(req, res);
});

server.listen(8080, 'localhost', startTestHook);

'use strict';

let http = require('http');
let Router = require('../index.js');
let expect = require('expect');

//Create routes
let routes = {
  'GET': {
    '/': (req, res) => {
      res.end('Path: At home');
    },
    '/clean': (req, res) => {
      res.end('Path: Got clean');
    },
    'default': (req, res) => {
      res.end('Path: Default route');
    },
  },
  'PUT': {
    '/': (req, res) => {
      res.end('Path: Home Put');
    },
    'default': (req, res) => {
      res.end('Path: Default Put');
    },
  },
};

//Create test requests
let reqList = [];
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
Router.init(routes);

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
  Router.route(req, res);
});

server.listen(8080, 'localhost', startTestHook);

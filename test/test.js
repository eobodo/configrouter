'use strict';

let http = require('http');
let Router = require('../index.js');
let expect = require('expect');

//Create routes
let routes = {
  'GET': {
    '/': (req, res, params) => {
      res.end('GET home');
    },
    '/clean': (req, res, params) => {
      res.end('GET clean');
    },
    '/notFound': (req, res, params) => {
      res.end('GET notFound');
    },
  },
  'POST': {
    '/': (req, res, params) => {
      res.end('POST home');
    },
    '/clean': (req, res, params) => {
      res.end('POST clean');
    },
    '/notFound': (req, res, parms) => {
      res.end('POST notFound');
    },
  },
  'PUT': {
    '/a': (req, res, params) => {
      res.end('PUT a');
    },
    '/b': (req, res, params) => {
      res.end('PUT b');
    },
    '/notFound': (req, res, parms) => {
      res.end('PUT notFound');
    },
  },
};

//Init router
let router = new Router(routes);


function startTestHook() {
  //Create test requests
  let reqList = [];
  let testData = [
    { method: 'GET', path: '/', err: 'GET home'},
    { method: 'GET', path: '/clean', err: 'GET clean'},
    { method: 'GET', path: '/wrongPath', err: 'GET notFound'},
    { method: 'POST', path: '/', err: 'POST home'},
    { method: 'POST', path: '/clean', err: 'POST clean'},
    { method: 'POST', path: '/wrongPath', err: 'POST notFound'},
    { method: 'PUT', path: '/a', err: 'PUT a'},
    { method: 'PUT', path: '/b', err: 'PUT b'},
    { method: 'PUT', path: '/c', err: 'PUT notFound'},
  ];

  for (let m in testData) {
    reqList.push({
      hostname: 'localhost',
      port: '8080',
      method: testData[m].method,
      path: testData[m].path,
    });
  }

  for (let count = 0; count < reqList.length; count++) {
    //test('Expect');

    let currentReq = reqList[count];
    http.get(currentReq, (pendingReq) => {

      pendingReq.on('data', (data) => {
        expect(data.toString()).toBe(testData[count].err)

        console.log(count, currentReq);

        if (count === reqList.length-1) {
          console.log('\nTest completed successfully');
          serverRef.close();
        }
      });
    });
  }
}

let serverRef;

(function() {
  //Init Server
  let server = http.createServer((req, res) => {
    router.route(req, res);
  });

  serverRef = server;
  server.listen(8080, 'localhost', startTestHook);

})();

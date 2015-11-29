'use strict';

class Request {

  get(uri) {
    return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest;

  		xhr.addEventListener('error', reject);
  		xhr.addEventListener('load', resolve);
  		xhr.open('GET', uri);
  		xhr.send();
		});
  }

  put(uri, body) {
    return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest;

  		xhr.addEventListener('error', reject);
  		xhr.addEventListener('load', resolve);
  		xhr.open('PUT', uri);
  		xhr.send(body);
		});
  }
}

module.exports = Request;

/*
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function* (e) {
    let state = xhr.readyState;
    let status = xhr.status;
    //console.log(state, status, xhr.responseText);
    if (state === 4 && status === 200) {
      yield console.log(xhr.responseText);
    }
  };
  xhr.open('GET', 'sample.txt');
  xhr.send();
*/

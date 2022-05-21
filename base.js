// @ts-check

require('socket.io-client');

const { io } = require('socket.io-client');

const socket = io({});

socket.connect();

socket.on('change', () => {
  console.log('Change detected. Rebuilding...');
});

socket.on('reload', () => {
  console.log('Rebuilt. Reloading...');
  window.location.reload();
});

function JSXApp(htmlElementID) {
  const element = window.document.getElementById(htmlElementID);

  return {
    bootstrap: (component) => {
      element.replaceWith(component);
    },
  };
}

function createElement(tagName, attrs = {}, ...children) {
  if (tagName === 'fragment') return children;

  if (typeof tagName === 'function') {
    tagName = tagName(attrs);
  }

  let elem;

  if (tagName instanceof HTMLElement) {
    elem = tagName;
  } else {
    elem = document.createElement(tagName);
  }

  elem = Object.assign(elem, attrs);

  // const proxy = new Proxy(attrs, {
  //   set: (target, p, value) => {
  //     console.log(target, p, value);
  //     return true;
  //   },
  // });

  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child);
    else elem.append(child);
  }

  return elem;
}

global.JSXApp = JSXApp;
global.createElement = createElement;

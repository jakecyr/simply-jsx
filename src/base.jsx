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

  const proxy = new Proxy(attrs, {
    set: (target, p, value) => {
      console.log(target, p, value);
    },
  });

  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child);
    else elem.append(child);
  }

  return elem;
}

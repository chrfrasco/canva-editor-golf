import * as http from 'http';
import * as url from 'url';

const isPromise = obj =>
  obj != null && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

const urlParamPattern = /:([a-zA-Z]+)/;

const pathToRegex = path => {
  const regexStr = path.replace(urlParamPattern, (_, param) => `(?<${param}>[a-zA-Z0-9]+)`);
  return new RegExp(`^${regexStr}$`);
};

const enhanceRequest = request => {
  const { pathname, query: rawQuery } = url.parse(request.url);
  const query = rawQuery
    ? rawQuery
        .split('&')
        .map(pair => pair.split('='))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: decodeURIComponent(value) }), {})
    : {};
  return Object.assign(request, { query, url: pathname });
};

const enhanceResponse = response =>
  Object.assign(response, {
    locals: {},
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(obj) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(obj));
      return this;
    },
    send(str) {
      this.setHeader('Content-Type', 'text/html');
      this.end(str);
      return this;
    },
  });

export const create = () => {
  const handlers = {
    get: [],
    post: [],
  };

  const middlewares = [];

  const makeNext = (middlewares, request, response) => () => {
    const errorHandler = error => {
      response.status(500).send(`<pre>${error.stack}</pre>`);
    };
    try {
      if (middlewares.length > 0) {
        const [middleware, ...remainingMiddlewares] = middlewares;
        const next = makeNext(remainingMiddlewares, request, response);

        if (middleware.length > 2) {
          return middleware(request, response, next);
        }

        const result = middleware(request, response);
        if (isPromise(result)) {
          return result.then(() => next()).catch(errorHandler);
        }

        next();
      }

      const method = request.method.toLowerCase();
      const pair = handlers[method].find(([pathRegex]) => pathRegex.test(request.url));

      if (pair != null) {
        const [pathRegex, handler] = pair;

        const { groups: params } = pathRegex.exec(request.url);
        request.params = params;

        handler(request, response);
        return;
      }
    } catch (error) {
      errorHandler(error);
    }

    response.status(404).end();
  };

  const listen = (port, callback) =>
    http
      .createServer((request, response) => {
        enhanceRequest(request);
        enhanceResponse(response);
        makeNext(middlewares, request, response)();
      })
      .listen(port, callback);

  return {
    use(...middleware) {
      middlewares.push(...middleware);
      return this;
    },
    get(path, middleware) {
      handlers.get.push([pathToRegex(path), middleware]);
      return this;
    },
    post(path, middleware) {
      handlers.post.push([pathRegex(path), middleware]);
      return this;
    },
    listen,
  };
};

/* istanbul ignore file */

/*

	TODO: would be cool if this solution allowed something more elegant with req, res, and next
	(so it doesn't have to be defined in test file)

	TODO: would be cool if:

		server.get('/some/route') versus  server['/get/someRoute']

	TODO: this solution needs params parsing, ie.  /document/:id  ...

*/

global.makeHandlerTestable = handler => {
	const serverDummy = {};

	const routeDummy = (method, route, handlers) => {
		serverDummy[method+route] = handlers.filter(x => !!x)[0];
		return;
	};
	const appDummy = {
		get: (route, ...handlers) => routeDummy('get', route, handlers),
		post: (route, ...handlers) => routeDummy('post', route, handlers)
	};
	const protect = undefined;

	handler(appDummy, protect);

	return serverDummy;
};

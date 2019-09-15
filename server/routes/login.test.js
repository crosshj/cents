import handler from './login';

const server = makeHandlerTestable(handler);

describe('login routes', () => {

	xit('handles GET /login$ route', () => {
		// just a redirect, will need fancier test util, ie. makeHandlerTestable
	});

	xit('handles GET /login$ route', () => {
		// uses passport, will need better mocking of that
	});

});

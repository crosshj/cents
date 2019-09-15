import handler from './restart';

const server = makeHandlerTestable(handler);

describe('restart routes', () => {

	xit('handles GET /restart route', () => {
		// will need to mock process
		// might work - https://www.npmjs.com/package/jest-mock-process
	});

});

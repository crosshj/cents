import handler from './history';

const server = makeHandlerTestable(handler);

describe('history routes', () => {

	xit('handles GET /diffs route', () => {
		// reads diffs.log and does fancy things
	});

});

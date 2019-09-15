import accounts from './accounts';

const fs = require('fs');
jest.mock('fs');

const server = makeHandlerTestable(accounts);

describe('accounts routes', () => {

	it('handles GET /json route', () => {
		// pretend some file exists with basic accounts-type content
		fs.readFileSync.mockReturnValue(JSON.stringify({
			balance: {},
			assets: [],
			liabilities: []
		}));

		// mock express sending what route is supposed to send
		var sent;
		const req = {};
		const res = {
			json: (data) => { sent = data; }
		};
		server['get/json'](req, res);

		// assert that  basic stuff gets sent
		expect(Object.keys(sent)).toEqual([ 'balance', 'assets', 'liabilities', 'totals' ]);
	});

	xit('handles GET /accounts route', () => {
		// relies on call to database to get accounts
	});

	xit('handles POST /accounts route', () => {
		// just saves changes to file
	})

});

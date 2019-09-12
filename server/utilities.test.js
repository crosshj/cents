import {
    getAccountsFileName, updateAccounts
} from './utilities';

const fs = require('fs');
jest.mock('fs');

describe('server utilities: getAccountsFileName', () => {

    it('returns default accounts when accounts file is NOT present', () => {
        fs.existsSync.mockReturnValue(false);
        const filename = getAccountsFileName();
        expect(filename).toMatch(/^.*default.json$/);
    });

    it('returns accounts when accounts file is present (and well formed)', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify({
            balance: {},
            assets: [],
            liabilities: []
        }));
        const filename = getAccountsFileName();
        expect(filename).toMatch(/^.*accounts.json$/);
    });

    it('returns default accounts when accounts file is present but malformed', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue('');
        var filename = getAccountsFileName();
        expect(filename).toMatch(/^.*default.json$/);

        fs.readFileSync.mockReturnValue(JSON.stringify({
            Xbalance: {},
            assets: [],
            liabilities: []
        }));
        filename = getAccountsFileName();
        expect(filename).toMatch(/^.*default.json$/);

        fs.readFileSync.mockReturnValue(JSON.stringify({
            balance: {},
            Xassets: [],
            liabilities: []
        }));
        filename = getAccountsFileName();
        expect(filename).toMatch(/^.*default.json$/);

        fs.readFileSync.mockReturnValue(JSON.stringify({
            balance: {},
            assets: [],
            Xliabilities: []
        }));
        filename = getAccountsFileName();
        expect(filename).toMatch(/^.*default.json$/);
    });

});

xdescribe('server utilities: updates accounts', () => {

    it('auto marks DUE and PAID', () => {
        expect(true).toBe(true);
    });

    it('auto-marks group status based on child items', () => {
        expect(true).toBe(true);
    });

    it('sorts liabilities', () => {
        expect(true).toBe(true);
    });

    it('creates totals', () => {
        expect(true).toBe(true);
    });

});
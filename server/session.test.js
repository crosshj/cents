import AppSession from './session';

let session;
let app;

describe('app session: local file store', () => {

    beforeAll(() => {
        jest.mock('session-file-store', () => (session) => class {
            constructor(fsOptions){
            }

            on() {
            }
        });
    });

    beforeEach(() => {
        app = {
            using: []
        };
        app.use = (u) => app.using.push(u);

        const store = 'file';
        const settings = {};
        session = new AppSession(app, store, settings);
    });

    it('handles intialization', () => {
        expect(session.store).toEqual('file');

        // should have told express to use some things (why is initialize here?)
        expect(app.using.map(x => x.name)).toEqual([ 'session', 'initialize', 'authenticate']);

        //TODO: other important assertions?
    });

    it('keeps unauthenticated users from accessing protected JSON route', () => {
        var req = {
            isAuthenticated: () => false,
            headers: {
                accept: 'json'
            }
        };
        var res = {
            send: jest.fn()
        };
        var next = jest.fn();
        session.protect(req, res, next);

        expect(res.send).toBeCalledWith({ error: 'not logged in' });
    });

    it('keeps unauthenticated users from accessing protected non-JSON route', () => {
        var req = {
            isAuthenticated: () => false,
            headers: {
                accept: '*'
            }
        };
        var res = {
            redirect: jest.fn()
        };
        var next = jest.fn();
        session.protect(req, res, next);

        //TODO: handle redirect to URL if not logged in before request
        expect(res.redirect).toBeCalledWith('./login');
    });

    it('allows authenticated user to access protected route', () => {
        var req = {
            isAuthenticated: () => true,
            user: {
                username: 'dummy'
            },
            cookies: {
                username: 'dummy'
            }
        };
        var res = {
            cookie: jest.fn()
        };
        var next = jest.fn();
        session.protect(req, res, next);

        expect(res.cookie).not.toBeCalled();
        expect(next).toBeCalledWith();

        // test case where cookie is not set
        req.cookies = {};
        next = jest.fn();

        session.protect(req, res, next);

        expect(res.cookie).toBeCalledWith("username", "dummy", {"httpOnly": true, "maxAge": 900000});
        expect(next).toBeCalledWith();

    });

});

describe('app session: local mongo store', () => {

    // TODO: this is basically the same thing as above, but requires a different mock
    xit('handles intialization', () => {
    });

    xit('keeps unauthenticated users from accessing protected route', () => {
    });

    xit('allows authenticated user to access protected route', () => {
    });

});

describe('app session: redis store', () => {

    xit('handles intialization', () => {
    });

    xit('keeps unauthenticated users from accessing protected route', () => {
    });

    xit('allows authenticated user to access protected route', () => {
    });

});

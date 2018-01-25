import app from './app';
import popup from './popup';
import root from './root';

export default {
    app: root.bind(app),
    popup: root.bind(popup)
};

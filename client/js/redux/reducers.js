import app from '../../reducers/app';
import popup from '../../reducers/popup';
import root from '../../reducers/root';

export default {
    app: root.bind(app),
    popup: root.bind(popup)
};

import {
  clone,
  // safeAccess
} from '../helpers/utilities';

/*

page reducer

*/

function changePage(state, action, root) {
  console.log('--- page reducer: changePage');
  console.log({ state, action, root });
  var newState = action.payload;
  return newState;
}

function page(state, action, root) {
  var newState = undefined;
  switch (action.type) {
    case 'PAGE_CHANGE':
      newState = changePage(state, action, root);
      break;
    default:
      newState = clone(state || {});
  }

  return newState || state || {};
}

export default page;
export {
  changePage
};

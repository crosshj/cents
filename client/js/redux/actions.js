
var dispatch = undefined;

export function init(store){
    dispatch = store.dispatch;
}

export default function action(args){
    dispatch(args);
}

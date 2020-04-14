import libCommon from '../../Common/Library/CommonLibrary';

/**
* Decrement the count on every on return to keep the Current Page count correct
* @param {IClientAPI} context
*/
export default function PageCountOnReturn(context) {
    let currentPageCount = libCommon.getStateVariable(context, 'CurrentPageCount') - 1;
    libCommon.setStateVariable(context, 'CurrentPageCount', currentPageCount);
}

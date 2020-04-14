/**
* Describe this function...
* @param {IClientAPI} context
*/
import pageCaptionCount from '../../Common/PageCaptionCount';
export default function PartsOnlinePickerListViewOnLoaded(context) {
    context.dismissActivityIndicator();
    return pageCaptionCount(context, 'select_material');

}

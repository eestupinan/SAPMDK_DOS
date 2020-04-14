import isAndroid from '../Common/IsAndroid';

export default function AnalyticsTitlePosition(context) {
    if (isAndroid(context)) {
        return 'top';
    } 
    return 'bottom';
}

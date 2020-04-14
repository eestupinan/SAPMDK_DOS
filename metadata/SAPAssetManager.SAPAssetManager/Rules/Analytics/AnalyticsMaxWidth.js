import isAndroid from '../Common/IsAndroid';

export default function AnalyticsMaxWidth(context) {
    if (isAndroid(context)) {
        return '328';
    } 
    return '';
}

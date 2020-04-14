import isAndroid from '../Common/IsAndroid';

export default function AnalyticsXOffset(context) {
    if (isAndroid(context)) {
        return '8.0';
    } 
    return '4.0';
}

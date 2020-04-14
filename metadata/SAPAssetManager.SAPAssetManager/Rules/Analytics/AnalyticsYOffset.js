import isAndroid from '../Common/IsAndroid';

export default function AnalyticsYOffset(context) {
    if (isAndroid(context)) {
        return '-34.0';
    } 
    return '14.0';
}

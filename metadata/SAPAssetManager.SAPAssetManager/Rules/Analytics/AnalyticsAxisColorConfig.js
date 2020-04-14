import platform from '../Common/IsAndroid';

export default function AnalyticsAxisColorConfig(context) {
    if (platform(context)) {
        return 'CCCCCC';
    } 
    return '666666';
}

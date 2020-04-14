import platform from '../Common/IsAndroid';

export default function AnalyticsAxisLabelColorConfig(context) {
    if (platform(context)) {
        return '666666';
    } 
    return '8E8E8E';
}

import platform from '../Common/IsAndroid';

export default function AnalyticsAxisStyleConfig(context) {
    if (platform(context)) {
        return 'solid';
    } 
    return 'dotted';
}

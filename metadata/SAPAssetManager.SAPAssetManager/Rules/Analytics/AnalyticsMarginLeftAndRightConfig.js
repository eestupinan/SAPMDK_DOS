import platform from '../Common/IsAndroid';

export default function AnalyticsMarginLeftAndRightConfig(context) {
    if (platform(context)) {
        return 16.0;
    } 
    return 0.0;
}

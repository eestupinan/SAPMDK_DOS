import platform from '../Common/IsAndroid';

export default function AnalyticsMarginTopAndBottomConfig(context) {
    if (platform(context)) {
        return 16.0;
    }
    return 32.0;
}

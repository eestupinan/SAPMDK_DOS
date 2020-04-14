import platform from '../Common/IsAndroid';

export default function AnalyticsColorsConfig(context) {
    if (platform(context)) {
        return ['5CBAE6'];
    } 
    return ['5899DA'];
}

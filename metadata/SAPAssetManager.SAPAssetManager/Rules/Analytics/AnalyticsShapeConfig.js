import platform from '../Common/IsAndroid';

export default function AnalyticsShapeConfig(context) {
    if (platform(context)) {
        return 'none';
    } return 'circle';
}

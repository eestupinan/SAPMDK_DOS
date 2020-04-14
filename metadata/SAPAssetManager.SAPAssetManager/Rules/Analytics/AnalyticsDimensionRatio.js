import isAndroid from '../Common/IsAndroid';

export default function AnalyticsDimensionRatio(context) {
    if (isAndroid(context)) {
        return '328:186';
    } 
    return '';
}

import platform from '../Common/IsAndroid';

export default function MinimumInteritemSpacing(context) {
    if (platform(context)) {
        return 12;
    } 
    return 66; 
}

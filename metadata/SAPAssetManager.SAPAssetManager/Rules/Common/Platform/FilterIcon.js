import isAndroid from '../IsAndroid';

export default function FilterIcon(context) {
    if (isAndroid(context)) {
        return 'res://filter';
    } else {
        return '';
    }
}

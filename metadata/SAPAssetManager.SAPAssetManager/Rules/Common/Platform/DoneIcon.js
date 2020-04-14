import isAndroid from '../IsAndroid';

export default function DoneIcon(context) {
    if (isAndroid(context)) {
        return '';
    } else {
        return 'Done';
    }
}

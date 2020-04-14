import isAndroid from '../Common/IsAndroid';

export default function NoteSaveText(context) {
    if (isAndroid(context)) {
        return context.localizeText('save');
    } else {
        return '';
    }
}

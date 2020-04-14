import libCommon from '../../Common/Library/CommonLibrary';
export default function ReadingDifference(context) {
    if (libCommon.isDefined(context.binding.IsCounterReading)&& context.binding.IsCounterReading === 'X') {
        return context.formatNumber(context.binding.CounterReadingDifference);
    } else {
        return '-';
    }
}

export default function MeasuringPointReading(pageClientAPI) {
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    let binding = pageClientAPI.binding;
    if (binding.hasOwnProperty('ReadingValue')) {
        return pageClientAPI.formatNumber(binding.ReadingValue);
    } else {
        return '';
    }
}

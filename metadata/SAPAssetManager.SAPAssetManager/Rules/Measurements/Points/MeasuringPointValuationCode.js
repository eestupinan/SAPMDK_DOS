export default function MeasuringPointValuationCode(pageClientAPI) {
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    let binding = pageClientAPI.binding;
    if (binding.hasOwnProperty('ValuationCode')) {
        return binding.ValuationCode;
    } else {
        return binding.MeasuringPoint.ValuationCode;
    }
}

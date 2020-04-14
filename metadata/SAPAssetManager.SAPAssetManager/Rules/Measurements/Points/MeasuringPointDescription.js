export default function MeasuringPointDescription(pageClientAPI) {
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    let binding = pageClientAPI.binding;
    if (binding.hasOwnProperty('PointDesc')) {
        return binding.PointDesc;
    } else {
        return binding.MeasuringPoint.PointDesc;
    }
}

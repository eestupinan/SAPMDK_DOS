import {ValueIfExists} from '../../Common/Library/Formatter';

export default function MeasuringPointUOM(pageClientAPI) {
    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    let binding = pageClientAPI.binding;
    if (binding.hasOwnProperty('UoM')) {
        return ValueIfExists(binding.UoM);
    } else {
        return ValueIfExists(binding.MeasuringPoint.UoM);
    }
}

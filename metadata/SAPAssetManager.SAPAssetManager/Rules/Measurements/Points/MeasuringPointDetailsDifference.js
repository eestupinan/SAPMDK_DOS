import libPoint from '../MeasuringPointLibrary';

export default function MeasuringPointDetailsDifference(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPoint.measuringPointDetailsFieldFormat(pageClientAPI, 'Difference');

}

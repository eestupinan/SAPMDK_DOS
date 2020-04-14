import libPoint from '../MeasuringPointLibrary';

export default function MeasurementDocumentReadingTime(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPoint.measurementDocumentCreateUpdateSetODataValue(pageClientAPI, 'ReadingTime');

}

import libPoint from '../MeasuringPointLibrary';

export default function MeasurementDocumentShortTextNote(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    return libPoint.measurementDocumentCreateUpdateSetODataValue(pageClientAPI, 'ShortTextNote');

}

import { GenerateLocalIDWithChangeSetIncrement } from '../../Common/GenerateLocalIDWithChangeSetIncrement';
import libCommon from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentMeasurementDocNumWithChangeSetIncrement(context) {
    if (!context) {
        throw new TypeError("Context can't be null or undefined");
    }
    // Counter starts at 0, increment of first created entity must be 1
    let increment = libCommon.getCurrentChangeSetActionCounter(context) + 1;

    return GenerateLocalIDWithChangeSetIncrement(context, 'MeasurementDocuments', 'MeasurementDocNum', '', '', '', 'SortField', increment);
}

import libPoint from '../MeasuringPointLibrary';
import libCom from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentCreateUpdateValidation(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    let dt = new Date();

    libCom.setStateVariable(pageClientAPI, 'CurrentDateTime', dt);



    //Check field data against business logic here
    //Return true if validation succeeded, or False if failed
    return libPoint.measurementDocumentCreateUpdateValidation(pageClientAPI).then(result => {
        return result;
    });
}

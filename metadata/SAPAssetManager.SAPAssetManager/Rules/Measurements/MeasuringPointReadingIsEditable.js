import libMesuringPointLib from './MeasuringPointLibrary';
import libCommon from '../Common/Library/CommonLibrary';
export default function MeasuringPointReadingIsEditable(pageClientAPI) {
    if (!libCommon.IsOnCreate(pageClientAPI)) {
        return !libMesuringPointLib.validateIsCounter(pageClientAPI.binding);
    } else {
        return true;
    }
}

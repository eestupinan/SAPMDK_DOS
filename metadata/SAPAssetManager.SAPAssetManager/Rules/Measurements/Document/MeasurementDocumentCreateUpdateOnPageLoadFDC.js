import libPoint from '../MeasuringPointLibrary';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';
import Stylizer from '../../Common/Style/Stylizer';
import libCommon from '../../Common/Library/CommonLibrary';

export default function MeasurementDocumentCreateUpdateOnPageLoadFDC(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    hideCancel(pageClientAPI);

    let controls = libCommon.getControlDictionaryFromPage(pageClientAPI);

    let readingSim = controls.ReadingSim;
    let uomSim = controls.UOMSim;
    let pointSim = controls.PointSim;
    let valuationCodeLstPkr = controls.ValuationCodeLstPkr;

    let textEntryStyle = new Stylizer(['FormCellTextEntry']);
    let readOnlyStylizer = new Stylizer(['GrayText']);

    readOnlyStylizer.apply(uomSim, 'Value');
    readOnlyStylizer.apply(pointSim, 'Value');
    textEntryStyle.apply(readingSim, 'Value');
    textEntryStyle.apply(valuationCodeLstPkr, 'Value');

    libCommon.setStateVariable(pageClientAPI, 'ReadingType','MULTIPLE');

    return libPoint.measurementDocumentCreateUpdateOnPageLoad(pageClientAPI);
}

import libPoint from '../MeasuringPointLibrary';
import libCom from '../../Common/Library/CommonLibrary';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';
import style from '../../Common/Style/StyleFormCellButton';
import Stylizer from '../../Common/Style/Stylizer';

export default function MeasurementDocumentCreateUpdateOnPageLoad(pageClientAPI) {

    if (!pageClientAPI) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    hideCancel(pageClientAPI);
    style(pageClientAPI, 'DiscardButton');
    let stylizer = new Stylizer(['GrayText']);
    let textEntryStyle = new Stylizer(['FormCellTextEntry']);
    let formCellContainerProxy = pageClientAPI.getControl('FormCellContainer');
    let pointSim = formCellContainerProxy.getControl('PointSim');
    let descriptionSim = formCellContainerProxy.getControl('DescriptionSim');
    let characteristicSim = formCellContainerProxy.getControl('CharacteristicSim');
    let readingSim = formCellContainerProxy.getControl('ReadingSim');
    let uomSim = formCellContainerProxy.getControl('UOMSim');
    let valuationCodeLstPkr = formCellContainerProxy.getControl('ValuationCodeLstPkr');
    
    stylizer.apply(pointSim, 'Value');
    stylizer.apply(descriptionSim, 'Value');
    stylizer.apply(characteristicSim, 'Value');
    stylizer.apply(uomSim, 'Value');
    textEntryStyle.apply(readingSim, 'Value');
    textEntryStyle.apply(valuationCodeLstPkr, 'Value');

    libCom.setStateVariable(pageClientAPI, 'ReadingType','SINGLE');
    libCom.clearFromClientData(pageClientAPI, ['LastCounterReading'], undefined, true);

    libPoint.measurementDocumentCreateUpdateOnPageLoad(pageClientAPI);
}

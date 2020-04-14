import libCom from '../../Common/Library/CommonLibrary';

export default function MeasuringPointsDataEntryNavWrapper(context) {

    if (!context) {
        throw new TypeError('Context can\'t be null or undefined');
    }

    //Remove old readings from memory
    libCom.clearFromClientData(context, ['LastCounterReading'], undefined, true);
    libCom.setStateVariable(context, 'TransactionType', 'CREATE');
    return context.executeAction('/SAPAssetManager/Actions/Measurements/MeasuringPointsDataEntryNav.action');
}

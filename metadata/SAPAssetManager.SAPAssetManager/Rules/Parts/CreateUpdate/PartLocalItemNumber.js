import GenerateLocalID from '../../Common/GenerateLocalID';
import libCom from '../../Common/Library/CommonLibrary';

export default function PartLocalItemNumber(context) {
    let OperationLstPkr = libCom.getTargetPathValue(context, '#Control:OperationLstPkr/#Value');
    let OperationLstPkrValue = libCom.getListPickerValue(OperationLstPkr);
    let WOLstPkrValue  = libCom.getTargetPathValue(context, '#Control:Order/#Value');
    let LocalId = GenerateLocalID(context, 'MyWorkOrderComponents', 'ItemNumber', '0000', `$filter=OrderId eq '${WOLstPkrValue}' and OperationNo eq '${OperationLstPkrValue}'`, '');
    return LocalId;
}

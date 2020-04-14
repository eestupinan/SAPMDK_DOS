import libCommon from '../../../Common/Library/CommonLibrary';
import libVal from '../../../Common/Library/ValidationLibrary';

export default function SubOperationCreateUpdateWorkorderChanged(control) {

    let formCellContainer = control.getPageProxy().getControl('FormCellContainer');
    if (!libVal.evalIsEmpty(formCellContainer)) {
        let WorkOrderLstPkrValue = formCellContainer.getControl('WorkOrderLstPkr').getValue();
        let OperationLstPkrControl = formCellContainer.getControl('OperationLstPkr');
        var OperationSpecifier = OperationLstPkrControl.getTargetSpecifier();
        if (!libVal.evalIsEmpty(WorkOrderLstPkrValue)) {
            OperationSpecifier.setService('/SAPAssetManager/Services/AssetManager.service');
            OperationSpecifier.setEntitySet(libCommon.getListPickerValue(WorkOrderLstPkrValue) + '/Operations');
            OperationSpecifier.setDisplayValue('{{#Property:OperationNo}} - {{#Property:OperationShortText}}');
            OperationSpecifier.setReturnValue('{@odata.readLink}');
            OperationSpecifier.setQueryOptions('$orderby=OperationNo');
            OperationLstPkrControl.setEditable(true);
        } else {
            OperationLstPkrControl.setEditable(false);
        }
        return OperationLstPkrControl.setTargetSpecifier(OperationSpecifier);
    }

}

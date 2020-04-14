import style from '../../Common/Style/StyleFormCellButton';
import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';
import QueryBuilder from '../../Common/Query/QueryBuilder';
import Stylizer from '../../Common/Style/Stylizer';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';

export default function ConfirmationCreateUpdateOnPageLoad(context) {
    hideCancel(context);
    let stylizer = new Stylizer(['GrayText']);
    const formCellContainerProxy = context.getControl('FormCellContainer');
    if (!context.getBindingObject().IsOnCreate) {
        style(context, 'DiscardButton');
    }


    if (!context.getBindingObject().IsWorkOrderChangable) {
        let woPicker = formCellContainerProxy.getControl('WorkOrderLstPkr');
        let confirmationId = formCellContainerProxy.getControl('ConfirmationIdProperty');
        stylizer.apply(woPicker, 'Value');
        stylizer.apply(confirmationId, 'Value');

        if (!context.getBindingObject().IsOperationChangable) {
            let opPicker = formCellContainerProxy.getControl('OperationPkr');
            stylizer.apply(opPicker, 'Value');
            if (!context.getBindingObject().IsSubOperationChangable) {
                let subOpPicker = formCellContainerProxy.getControl('SubOperationPkr');
                stylizer.apply(subOpPicker, 'Value');
            }
        }

    }
    let workOrderValue = libCom.getControlValue(formCellContainerProxy.getControl('WorkOrderLstPkr'));
    let queryBuilder = new QueryBuilder();
    let activityTypeControl = formCellContainerProxy.getControl('ActivityTypePkr');
    let specifier = activityTypeControl.getTargetSpecifier();
    if (!libVal.evalIsEmpty(workOrderValue)) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders('+ '\'' + workOrderValue +'\''+')', [], '$select=CostCenter,ControllingArea').then(function(data) {
            if (data.getItem(0)) {
                if (!libVal.evalIsEmpty(data.getItem(0).CostCenter)) {
                    queryBuilder.addFilter(`CostCenter eq '${data.getItem(0).CostCenter}'`);
                }
                if (!libVal.evalIsEmpty(data.getItem(0).ControllingArea)) {
                    queryBuilder.addFilter(`ControllingArea eq '${data.getItem(0).ControllingArea}'`);
                }
            }
            queryBuilder.addExtra('orderby=ActivityType asc'); 
            specifier.setEntitySet('COActivityTypes');
            specifier.setQueryOptions(queryBuilder.build());
            specifier.setService('/SAPAssetManager/Services/AssetManager.service');
            activityTypeControl.setTargetSpecifier(specifier);
            return true;
        });
    }
    return true;
}

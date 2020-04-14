import libCom from '../../../Common/Library/CommonLibrary';
import {TimeSheetLibrary as libTS} from '../../TimeSheetLibrary';
import libVal from '../../../Common/Library/ValidationLibrary';


export default function TimeSheetEntryCreateUpdateRecOrderUpdate(controlProxy) {
    let pageProxy = controlProxy.getPageProxy();
    let selection = controlProxy.getValue()[0] ? controlProxy.getValue()[0].ReturnValue : '';
    let opListPickerProxy = libCom.getControlProxy(pageProxy,'OperationLstPkr');
    let subOpListPickerProxy = libCom.getControlProxy(pageProxy,'SubOperationLstPkr');
    let activityTypeListPickerProxy = libCom.getControlProxy(pageProxy,'ActivityTypeLstPkr');

    let opSpecifier = opListPickerProxy.getTargetSpecifier();
    let subOpSpecifier = subOpListPickerProxy.getTargetSpecifier();
    let activityTypeSpecifier = activityTypeListPickerProxy.getTargetSpecifier();
    if (libVal.evalIsEmpty(selection)) {
        libCom.setFormcellNonEditable(opListPickerProxy);
    } else {
        libCom.setFormcellEditable(opListPickerProxy);
        opSpecifier.setEntitySet(selection + '/Operations');
        opSpecifier.setReturnValue('{@odata.readLink}');
        opSpecifier.setDisplayValue('{{#Property:OperationNo}} - {{#Property:OperationShortText}}');
        opSpecifier.setService('/SAPAssetManager/Services/AssetManager.service');
        opSpecifier.setQueryOptions('$orderby=OperationNo asc');
        opListPickerProxy.setTargetSpecifier(opSpecifier);
        subOpListPickerProxy.setTargetSpecifier(subOpSpecifier);
        // Set Query Options for Activity Type to sort based on Cost Center
        activityTypeSpecifier.setEntitySet('COActivityTypes');
        activityTypeSpecifier.setService('/SAPAssetManager/Services/AssetManager.service');
        return libTS.GetWorkCenterFromRecOrder(pageProxy, selection).then(newWorkCenter => {
            if (newWorkCenter) {
                return libTS.updateWorkCenter(controlProxy.getPageProxy(), newWorkCenter).then(() => {
                    return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', selection, [], []).then(result => {
                        if (!libVal.evalIsEmpty(result) && !libVal.evalIsEmpty(result.getItem(0).CostCenter)) {
                            activityTypeSpecifier.setQueryOptions(`$filter=CostCenter eq '${result.getItem(0).CostCenter}'&$orderby=ActivityType`);
                        } else {
                            activityTypeSpecifier.setQueryOptions('$orderby=ActivityType');
                        }
                        libCom.setFormcellNonEditable(subOpListPickerProxy);
                        return activityTypeListPickerProxy.setTargetSpecifier(activityTypeSpecifier);
                    });
                });
            }
            return '';
        });
    }
}

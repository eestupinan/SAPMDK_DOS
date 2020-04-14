import {TimeSheetLibrary as libTS} from '../../TimeSheetLibrary';

import libCom from '../../../Common/Library/CommonLibrary';

export default function TimeSheetEntryCreateUpdateOperationUpdate(controlProxy) {
    let pageProxy = controlProxy.getPageProxy();
    let recOrderProxy = libCom.getControlProxy(pageProxy, 'RecOrderLstPkr');
    let filter = '$orderby=SubOperationNo asc';
    

    if (recOrderProxy) {
        let selection = controlProxy.getValue()[0] ? controlProxy.getValue()[0].ReturnValue : '';
        let listPickerProxy = libCom.getControlProxy(pageProxy,'SubOperationLstPkr');
        return getWorkCenterFromOperation(pageProxy, selection).then(newWorkCenter => {
            if (newWorkCenter) {
                return libTS.updateWorkCenter(pageProxy, newWorkCenter).then(() => {
                    return libTS.ShouldEnableSubOperations(pageProxy).then(function(result) {
                        if (result) {
                            libCom.setFormcellEditable(listPickerProxy);
                            let specifier = listPickerProxy.getTargetSpecifier();
                            specifier.setEntitySet(selection + '/SubOperations');
                            specifier.setReturnValue('{@odata.readLink}');
                            specifier.setService('/SAPAssetManager/Services/AssetManager.service');
                            specifier.setQueryOptions(filter);
                            // When the Sub-operation is not specified during create, going to edit will never populate the sub-operation list since
                            // the setTargetSpecifier expects setDisplayValue to be NOT undefined.
                            specifier.setDisplayValue('{{#Property:SubOperationNo}} - {{#Property:OperationShortText}}');                
                            return listPickerProxy.setTargetSpecifier(specifier);
                        } else {
                            listPickerProxy.setValue('');
                            return libCom.setFormcellNonEditable(listPickerProxy);
                        }
                    });
                });
            }
            return '';
        });
    }       
}


function getWorkCenterFromOperation(context, operationReadLink) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', operationReadLink, [], '').then(result => {
        if (result && result.getItem(0)) {
            return result.getItem(0).MainWorkCenter;
        }
        return undefined;
    });
}

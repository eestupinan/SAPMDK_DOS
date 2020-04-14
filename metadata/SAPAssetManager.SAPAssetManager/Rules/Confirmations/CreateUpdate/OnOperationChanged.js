import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';

import SubOperationQueryOptions from './SubOperationPickerQueryOptions';

export default function OnOperationChanged(context) {
    let binding = context.getBindingObject();
    let selection = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    binding.Operation = selection;
    let pageProxy = context.getPageProxy();
    pageProxy._context.binding = binding;

    let subOpControl = libCom.getControlProxy(pageProxy, 'SubOperationPkr');
    let opControl = libCom.getControlProxy(pageProxy, 'OperationPkr');

    /* Clear the validation if the field is not empty */
    if (!libVal.evalIsEmpty(opControl.getValue())) {
        opControl.clearValidation();
    }
    
    let specifier = subOpControl.getTargetSpecifier();    
    
    if (selection.length === 0) {
        // Clear Sub Operation Picker
        specifier.setQueryOptions('');
        subOpControl.setEditable(false);
    } else {
        return SubOperationQueryOptions(pageProxy).then(function(result) {
            specifier.setQueryOptions(result);
            specifier.setService('/SAPAssetManager/Services/AssetManager.service');
            subOpControl.setEditable(true);
            return subOpControl.setTargetSpecifier(specifier);
        });
    }
    
    subOpControl.setTargetSpecifier(specifier);
}

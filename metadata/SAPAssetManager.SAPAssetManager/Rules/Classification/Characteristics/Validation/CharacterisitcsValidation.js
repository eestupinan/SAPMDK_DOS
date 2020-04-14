/**
   * Get the "CharValFrom" and "CharValTo" control from the page and apply
   * validation rules on them.
   * 
   * @param {} context
   * 
   * @returns {boolean} returns false if there are validation errors.
   * 
   */
import libCommon from '../../../Common/Library/CommonLibrary';
import validateControl from './CharacteristicsValidationControl';
import intervalValidation from './CharacteristicsInterval';
export default function CharacterisitcsValidation(context) {
    let controlNameFrom = libCommon.getStateVariable(context,'VisibleControlFrom');
    let isListPicker = libCommon.getStateVariable(context,'ListPicker');
    let isMultiListPicker = libCommon.getStateVariable(context,'MultiListPicker');

    // if the control that is visible is Single/Multiple Value List Picker, we dont 
    // have to do any validation as values are pre-defined.
    if (isListPicker || isMultiListPicker) {        
        return true;
    }
    let validationControls = [];
    let valueCode = ['2','3','4','5'];
    let controlFrom = libCommon.getControlProxy(context, controlNameFrom);
    validationControls.push(controlFrom);
    if (valueCode.includes(context.binding.ValueRel)) {
        let controlNameTo = libCommon.getStateVariable(context,'VisibleControlTo');
        let controlTo = libCommon.getControlProxy(context, controlNameTo);
        validationControls.push(controlTo);
        if (!intervalValidation(context, controlFrom, controlTo))
            return false;
    }
    for (var i = 0; i < validationControls.length; i++) {
        return validateControl(context, validationControls[i]);
    }

}

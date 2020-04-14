
let propertyMap = {
    'ActivityTypePkr': 'ActivityType',
    'SubOperationPkr': 'SubOperation',
    'VarianceReasonPkr': 'VarianceReason',
    'AcctIndicatorPkr': 'AccountingIndicator',
};

export default function OnListPickerValueChanged(context) {
    let binding = context.getBindingObject();
    let controlName = context.getName();

    let propertyKey = propertyMap[controlName];
    if (propertyKey === undefined) {
        return;
    }

    let selection = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    binding[propertyKey] = selection;
    context.getPageProxy()._context.binding = binding;
}


export default function PRTEquipmentOnChange(context) {
    
    let pageProxy = context.getPageProxy();
    let formCellContainer = pageProxy.getControl('FormCellContainer');

    let equipmentValue = context.getValue();
    let equipmentHasValue = equipmentValue.length !== 0 ? true : false;
    let UsageValueFieldControl = formCellContainer.getControl('UsageValueField');
    let UoMFieldControl = formCellContainer.getControl('UoMLstPkr');
    let ControlKeyLstPkr = formCellContainer.getControl('ControlKeyLstPkr');

    UsageValueFieldControl.setVisible(equipmentHasValue);
    UsageValueFieldControl.setEditable(equipmentHasValue);
    UoMFieldControl.setVisible(equipmentHasValue);
    UoMFieldControl.setEditable(equipmentHasValue);
    ControlKeyLstPkr.setVisible(equipmentHasValue);
    ControlKeyLstPkr.setEditable(equipmentHasValue);
}

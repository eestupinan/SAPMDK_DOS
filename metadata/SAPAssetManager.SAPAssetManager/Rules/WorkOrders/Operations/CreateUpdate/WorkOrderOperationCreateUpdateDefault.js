import WorkCenterControl from '../../../Common/Controls/WorkCenterControl';
import WorkCenterPlant from '../../../Common/Controls/WorkCenterPlantControl';

export default function WorkOrderOperationCreateUpdateDefault(control) {
    let controlName = control.getName();

    switch (controlName) {
        case 'EquipmentLstPkr':
            if (control.getPageProxy().binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader')
                return control.getPageProxy().binding.HeaderEquipment;
            else
                return control.getPageProxy().binding.OperationEquipment;
        case 'FunctionalLocationLstPkr':
            if (control.getPageProxy().binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader')
                return control.getPageProxy().binding.HeaderFunctionLocation;
            else
                return control.getPageProxy().binding.OperationFunctionLocation;
        case 'WorkCenterLstPkr':
            return WorkCenterControl.getOperationPageDefaultValue(control);
        case 'WorkCenterPlantLstPkr':
            return WorkCenterPlant.getOperationPageDefaultValue(control);
        default:
            return '';
    }
}

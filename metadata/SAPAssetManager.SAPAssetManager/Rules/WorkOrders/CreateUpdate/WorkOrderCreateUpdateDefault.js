import libCommon from '../../Common/Library/CommonLibrary';
import assnType from '../../Common/Library/AssignmentType';
import {WorkOrderLibrary} from '../WorkOrderLibrary';

let onCreate, onFollowUp;

function getDefaultValue(controlName) {
    let controlDefs = assnType.getWorkOrderAssignmentDefaults();
    return controlDefs[controlName].default;
}

export default function WorkOrderCreateUpdateDefault(control) {
    let controlName = control.getName();
	onCreate = libCommon.IsOnCreate(control.getPageProxy());
	onFollowUp = WorkOrderLibrary.getFollowUpFlag(control.getPageProxy());
	
    if (onCreate && !onFollowUp) {
        switch (controlName) {
            case 'MainWorkCenterLstPkr':
                return getDefaultValue('MainWorkCenter');
            case 'WorkCenterPlantLstPkr':
                return getDefaultValue('WorkCenterPlant');
            case 'PlanningPlantLstPkr':
                return getDefaultValue('PlanningPlant');
            default:
                return true;
        }
    } else {
        switch (controlName) {
            case 'MainWorkCenterLstPkr':
                return control.getPageProxy().binding.MainWorkCenter;
            case 'WorkCenterPlantLstPkr':
                return control.getPageProxy().binding.MainWorkCenterPlant;
            case 'PlanningPlantLstPkr':
                return control.getPageProxy().binding.PlanningPlant;
            default:
                return '';
        }
    }
}

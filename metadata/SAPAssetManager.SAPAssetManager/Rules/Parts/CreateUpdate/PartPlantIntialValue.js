import libCom from '../../Common/Library/CommonLibrary';
import WorkCenterPlant from '../../Common/Controls/WorkCenterPlantControl';

/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function PartPlantIntialValue(context) {
    if (libCom.IsOnCreate(context)) {
        return WorkCenterPlant.getOperationPageDefaultValue(context);
    } else {
        return context.binding.Plant;
    }
}

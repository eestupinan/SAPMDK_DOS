import { EquipmentLibrary as EquipmentLib } from './EquipmentLibrary';
import Logger from '../Log/Logger';
/**
 * Query options for the MyEquipments entityset shown on the equipment list view page.
 * @param context The PageProxy object.
 */
export default function EquipmentQueryOptions(context) {
    Logger.info(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryEquipment.global').getValue(), 'OData read called');
    //"#sap_mobile.MyWorkOrderHeader"
    let binding = context.binding;
    if (binding && binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader') {
        return `$expand=WorkCenter_Main_Nav&$filter=(WorkOrderHeader/any( wo: wo/OrderId eq '${binding.OrderId}' ) or WorkOrderOperation/WOHeader/any(wo: wo/OrderId eq '${binding.OrderId}' ) or WorkOrderSubOperation/WorkOrderOperation/WOHeader/any( wo: wo/OrderId eq '${binding.OrderId}' ))`;
    }
    if (binding && binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
        return '';
    }
    return EquipmentLib.equipmentListViewQueryOptions();
}

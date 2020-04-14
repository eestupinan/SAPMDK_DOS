

import Logger from '../Log/Logger';
/**
 * Send the parent entity type by evaluating the read links
 * @param {*} context 
 */
export default function ClassificationParentEntityType(context) {
    if (context.evaluateTargetPathForAPI('#Page:-Previous').getReadLink().includes('Equip')) {
        return 'Equipments';
    } else if (context.evaluateTargetPathForAPI('#Page:-Previous').getReadLink().includes('Func')) {
        return 'FunctionalLocations';
    } else {
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryClassifications.global').getValue() , 'Not a valid EntityType for Classification');
        return '';
    }
}

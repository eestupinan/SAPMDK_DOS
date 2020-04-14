import libCom from '../Common/Library/CommonLibrary';

export default function PartUpdateRequireFields(context) {
    if (libCom.isDefined(context.binding)) {
        if (context.binding.ItemCategory === libCom.getAppParam(context, 'PART', 'TextItemCategory')) {
            return ['RequiredFields',
                'Order',
                'OperationLstPkr',
                'PartCategoryLstPkr',
                'PlantLstPkr',
                'TextItemSim',
                'QuantitySim',
            ];
        } else {
            // if Stock Item is selected, MaterialUOMLstPkr would be visible
            return ['RequiredFields',
                'Order',
                'OperationLstPkr',
                'PartCategoryLstPkr',
                'PlantLstPkr',
                'MaterialLstPkr',
                'MaterialUOMLstPkr',
                'QuantitySim',
            ];
        }
    } 
}

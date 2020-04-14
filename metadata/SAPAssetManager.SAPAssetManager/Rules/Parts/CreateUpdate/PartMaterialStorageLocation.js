import libForm from '../../Common/Library/FormatLibrary';

export default function PartMaterialStorageLocation(context) {

        let formCellContainerProxy = context.getPageProxy().getControl('FormCellContainer');
        if (!formCellContainerProxy) {
            return [];
        }

        let plant = formCellContainerProxy.getControl('WorkCenterPlantLstPkr').getValue();
        let queryOption = '$orderby=StorageLocation,StorageLocationDesc';

        if (plant.length > 0) {
            queryOption += "&$filter= Plant eq '"+ plant[0].ReturnValue + "'";
        }

        var pickerItems = [];

        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MaterialSLocs', [], queryOption).then(function(result) {
            if (result && result.length > 0) {
                let returnValue = [];
                result.forEach(function(value) {
                    returnValue.push({DisplayValue: libForm.formatListPickerDisplayValue(context,value.StorageLocation,value.StorageLocationDesc), ReturnValue: value.StorageLocation});
                });
                pickerItems = returnValue.reduce((acc,current)=>{
                    let x = acc.find(item => item.DisplayValue === current.DisplayValue);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                },[]);
                return pickerItems;
            }
            return [];
        });
}

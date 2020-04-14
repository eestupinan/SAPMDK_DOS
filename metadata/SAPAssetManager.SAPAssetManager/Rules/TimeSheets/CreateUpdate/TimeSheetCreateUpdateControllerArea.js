import libCom from '../../Common/Library/CommonLibrary';

export default function TimeSheetCreateUpdateControllerArea(clientAPI) {

    let workOrder = libCom.getListPickerValue(libCom.getTargetPathValue(clientAPI, '#Control:RecOrderLstPkr/#Value'));
    if (workOrder) {
        return clientAPI.read('/SAPAssetManager/Services/AssetManager.service', workOrder, [], '$select=ControllingArea').then(function(data) {
            return data.getItem(0).ControllingArea;
        });
    }
    
    return clientAPI.read('/SAPAssetManager/Services/AssetManager.service', 'UserSystemInfos', [], '').then(function(result) {
        var controllerArea = '';
        if (result) {
            var len = result.length;
            if (len > 0) {
                result.forEach(function(element) {
                    if (element.SystemSettingName === 'CO_AREA') {
                        controllerArea = element.SystemSettingValue;
                    }
                });
            }
        }
        return controllerArea;
    });
}

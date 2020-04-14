import libCommon from '../../Common/Library/CommonLibrary';

export default function EquipmentInstallationChangeSet(context) {

    let equipments = context.getControl('FormCellContainer').getControl('EquipmentPicker').getValue();
    return libCommon.CallActionWithPickerItems(context, '/SAPAssetManager/Actions/Equipment/Installation/EquipmentInstallationChangeSet.action', equipments).then(() => {
        return context.executeAction('/SAPAssetManager/Actions/Equipment/Installation/InstallationSuccess.action');
    });
}

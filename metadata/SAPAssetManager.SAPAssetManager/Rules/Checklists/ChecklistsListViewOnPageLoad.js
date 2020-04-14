
export default function checklistsListViewOnPageLoad(context) {

    let binding = context.getBindingObject();
    if (binding['@odata.type'] === '#sap_mobile.MyEquipment') {
        return context.count('/SAPAssetManager/Services/AssetManager.service', binding['@odata.readLink']+'/EquipAssessments_Nav', '').then(count => {
            let params=[count];
            context.setCaption(context.localizeText('checklists_x', params));
        }); 
    }
    return '';
}


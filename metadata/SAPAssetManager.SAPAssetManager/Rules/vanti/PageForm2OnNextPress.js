import PageFields from './PageFields';
export default function PageForm2OnNextPress(context) {

	var sMsg = PageFields.checkRequiredFields(context, "pageTestForm2");

	if (sMsg) {

		context.binding.sMsg = sMsg;
		return context.executeAction('/SAPAssetManager/Actions/vanti/MandatoryFieldMessage.action');

	} else {

		PageFields.goNextActionPage(context, "INST_SUST_MED");
		
	}

}
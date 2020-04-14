
/**
 * Rule lets you formart the work order list view row any which way you want.
 */
export default function WorkOrdersListViewStatus(context) {
	 return context.read('/SAPAssetManager/Services/AssetManager.service', "Priorities(PriorityType='" + context.binding.PriorityType + "',Priority='" + context.binding.Priority +"')", [], '$select=PriorityDescription').then(
            Priorities => {
            	var tmp = JSON.stringify(Priorities);
        		return 'pr = ' + tmp.substring(tmp.length - 10, tmp.length);//Priorities.getItem(0).PriorityDescription;
            	/*
            	if (Priorities) {
            		var tmp = JSON.stringify(Priorities.getItem(0));
            		return tmp.substring(tmp.length - 50, tmp.length);//Priorities.getItem(0).PriorityDescription;
            	}
            	else {
            		return 'Sin Prioridad';
            	}
            	*/
            }
    );
}

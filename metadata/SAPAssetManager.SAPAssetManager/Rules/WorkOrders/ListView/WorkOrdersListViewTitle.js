
/**
 * Rule lets you formart the work order list view row any which way you want.
 */
export default function WorkOrderListsViewTitle(context) {

	return context.binding.OrderType + ' / ' + (context.binding.Address == undefined || context.binding.Address == null ? '' : context.binding.Address.Barrio) ; 
}

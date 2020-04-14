
/**
 * Rule lets you formart the work order list view row any which way you want.
 */
export default function WorkOrderListDireccion(context) {

	return context.binding.OrderType + ' | ' + context.binding.Direccion; 
}

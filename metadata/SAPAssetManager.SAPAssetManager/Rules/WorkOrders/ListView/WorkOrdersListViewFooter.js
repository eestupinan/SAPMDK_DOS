
/**
 * Rule lets you formart the work order list view row any which way you want.
 */
export default function WorkOrdersListViewFooter(context) {

	return context.binding.Municipio + ' - ' + context.binding.UnidadLectura + ' - ' + context.binding.CodOrdLectura; 
}

export default function NombreCliente(context) {
	let WOPartners = context.getPageProxy().binding.WOPartners;
	let value = "";
	
	WOPartners.forEach(bp => {
		if(bp.PartnerFunction == 'SO' || bp.PartnerFunction == 'SP'){
			value = bp.Address_Nav.Name;
		}
	});
	
	return value;
}
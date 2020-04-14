import BusinessPartnerCountry from '../BusinessPartnerCountry';

export default function IsBusinessPartnerStateEditable(context) {
    return BusinessPartnerCountry(context.getPageProxy()).length > 0;
}

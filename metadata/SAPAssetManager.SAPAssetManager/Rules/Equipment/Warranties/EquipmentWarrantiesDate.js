import OffsetODataDate from '../../Common/Date/OffsetODataDate';
/**
 * Convert backend date into readable format
 * @param {*} context SectionProxy object.
 * @param {String} date Date String
 * @returns {String} Formatted Date String
 */
export default function EquipmentWarrantiesDate(context, date) {
    let odataDate = OffsetODataDate(context, date);
    return context.formatDate(odataDate.date());
}

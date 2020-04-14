import libVal from '../../Common/Library/ValidationLibrary';
import OffsetODataDate from '../../Common/Date/OffsetODataDate';

export default function WorkOrderHistoryStartEndDate(context) {
    var binding = context.binding;

    //yyyy-mm-dd
    let startDate = !libVal.evalIsEmpty(binding.StartDate) ? context.formatDate(OffsetODataDate(context, binding.StartDate).date()) : '';
    let endDate = !libVal.evalIsEmpty(binding.EndDate) ? context.formatDate(OffsetODataDate(context, binding.EndDate).date()): 'ongoing';

    return startDate + ' - ' + endDate;
} 


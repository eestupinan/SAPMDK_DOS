import { WorkOrderLibrary as libWo} from '../WorkOrderLibrary';

export default function WorkOrdersListViewQueryOption(context) {
    if (context.binding.isHighPriorityList) {
        return libWo.getHighPriorityWorkOrdersQueryOptions();
    } else {
        return libWo.getWorkOrdersListViewQueryOptions();
    }
}

import checklistsCount from './EquipmentChecklistsCount';

export default function EquipmentChecklistsSearchEnabled(context) {
    return checklistsCount(context).then(count => {
        return count !== 0;
    });
}

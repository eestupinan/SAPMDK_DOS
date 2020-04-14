export default function ValidateRelation(valueFrom, valueTo, relation) {
    switch (relation) {
        case '<=':
            return valueFrom <= valueTo;
        case '<':
            return valueFrom < valueTo;
        case '>=':
            return valueFrom >= valueTo;
        case '>':
            return valueFrom > valueTo;
        default:
             return false;
    }    
}

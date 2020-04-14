import ValidateRelation from './ValidateRelation';

export default function CharacteristicsValidationCheck(context, valueFrom, valueTo, valueRelation) {
    switch (context.binding.Characteristic.DataType) {
        case 'DATE':
            //We need to check if date are obeying the relation.
            // This rule is doing simple data check. For Example:
            // 08-24-1992 > 08-24-1995 would return true
            return ValidateRelation(valueFrom,valueTo,valueRelation);
        case 'TIME':
            //For time we need to check if both time are in the same day
            //So before checking 9:00PM < 10:00PM, we need to check that
            // both these time are on the same day, else it would reutrn 
            // false. So May 18th 9:00PM < May 17th 10:00PM would return
            // false  
            return valueFrom.getDate() === valueTo.getDate() && ValidateRelation(valueFrom,valueTo,valueRelation);
        default:
            return eval(valueFrom + valueRelation + valueTo);
    }
}

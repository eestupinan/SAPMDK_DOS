import libPart from '../PartLibrary';
export default function PartCreateSummaryOnPageLoad(context) {
    if (!context) {
        throw new TypeError('Context can\'t be null or undefined');
    }
    libPart.partCreateSummaryFieldValues(context);
    libPart.partSummaryCreateUpdateOnPageLoad(context);
}

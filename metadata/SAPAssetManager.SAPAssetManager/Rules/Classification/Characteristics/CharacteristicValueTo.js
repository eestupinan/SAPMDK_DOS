import libVal from '../../Common/Library/ValidationLibrary';
export default function CharacteristicValueTo(context) {
    return libVal.evalIsEmpty(context.binding.CharValTo) ? '' :  context.binding.CharValTo.toString();
}

import dataType from './CharacteristicDateOrTimeOrValue';
import relationship from './CharacteristicRelationDescription';
import libVal from '../../../Common/Library/ValidationLibrary';

export default function CharacteristicsRelationshipToSign(context) {
    if (libVal.evalIsEmpty(context.binding.ValueRel)) {
        return context.localizeText('value');
    } else {
        switch (context.binding.ValueRel) {
            case '1':
                return dataType(context);
        default:
                return relationship(context, context.binding.CharValCode_Nav.ValueCode2);
        }
    }
}

import libCom from '../Common/Library/CommonLibrary';

export default function formReadLink(context) {

    return libCom.getStateVariable(context, 'FormReadlink');

}

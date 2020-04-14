import libCom from '../../Common/Library/CommonLibrary';
import ODataDate from '../../Common/Date/ODataDate';

export default function FormattedPostingDate(context) {

    let postingDate = context.getBindingObject().PostingDate;
    let date = new ODataDate(postingDate).date();

    return libCom.relativeDayOfWeek(date, context) + ', ' + context.formatDate(date);
}

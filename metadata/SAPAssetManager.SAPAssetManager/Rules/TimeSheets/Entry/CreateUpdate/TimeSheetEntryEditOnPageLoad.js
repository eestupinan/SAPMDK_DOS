import { TimeSheetEventLibrary as libTSEvent} from '../../TimeSheetLibrary';
import style from '../../../Common/Style/StyleFormCellButton';
import hideCancel from '../../../ErrorArchive/HideCancelForErrorArchiveFix';

export default function TimeSheetEntryEditOnPageLoad(pageClientAPI) {
    hideCancel(pageClientAPI);
    style(pageClientAPI, 'DiscardButton');
    return libTSEvent.TimeSheetEntryEditOnPageLoad(pageClientAPI);
}

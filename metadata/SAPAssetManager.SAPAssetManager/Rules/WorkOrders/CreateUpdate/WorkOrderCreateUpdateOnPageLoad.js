import {WorkOrderEventLibrary as LibWoEvent} from '../WorkOrderLibrary';
import style from '../../Common/Style/StyleFormCellButton';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';

export default function WorkOrderCreateUpdateOnPageLoad(pageClientAPI) {
    hideCancel(pageClientAPI);
    LibWoEvent.createUpdateOnPageLoad(pageClientAPI);
    style(pageClientAPI, 'DiscardButton');
}

import { Reminder as libRem } from '../UserPreferences/UserPreferencesLibrary';
import style from '../Common/Style/StyleFormCellButton';

export default function ReminderCreateUpdateOnPageLoad(context) {
    libRem.reminderCreateUpdateOnPageLoad(context);
    style(context, 'DiscardButton');

}

/** Clear the state variable when user hit Cancel */
import cleanClientData from './CharacteristicCleanUp';
export default function CharacteristicCleanUpOnCancel(pageProxy) {
    cleanClientData(pageProxy);
    return pageProxy.executeAction('/SAPAssetManager/Actions/Page/CancelPage.action');
}

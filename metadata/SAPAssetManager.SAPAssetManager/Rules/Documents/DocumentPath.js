import DocumentID from './DocumentID';
import Logger from '../Log/Logger';
let fs = require('file-system');

export default function DocumentPath(context, documentObject) {
    let documentID = DocumentID(documentObject);
    let filename = documentObject.FileName;
    let tempFolder = fs.knownFolders.temp();
    if (filename && documentID) {
        return fs.path.join(tempFolder.path, documentID, filename);
    } else {
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryDocuments.global').getValue(), 'Document ID or file name does not exist');
        return '';
    }
  
}

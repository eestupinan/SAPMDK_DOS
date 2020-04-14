export default function ChecklistQuestioinsUpdateNav(context) {

    let extension = context.getControl('FormCellContainer')._control;

    extension.executeChangeSet('/SAPAssetManager/Actions/Checklists/AnswerUpdateChangeSet.action');
}

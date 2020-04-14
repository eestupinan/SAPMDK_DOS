
export default function PrioritySubstatusText(context) {
    let priority = context.binding.Priority;
    let text;
    switch (priority) {
        case '1':
            text = context.localizeText('very_high');
            break;
        case '2':
            text = context.localizeText('high');
            break;
        default:
            return '';
    }
    return text;
}

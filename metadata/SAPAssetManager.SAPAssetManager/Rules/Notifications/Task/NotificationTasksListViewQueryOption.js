export default function NotificationTasksListViewQueryOption() {
    return '$expand=Notification,MobileStatus&$orderby=TaskSortNumber asc';
}

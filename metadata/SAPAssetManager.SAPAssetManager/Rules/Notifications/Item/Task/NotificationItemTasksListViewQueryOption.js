export default function NotificationItemTasksListViewQueryOption() {
    return '$expand=MobileStatus,Item/Notification&$orderby=TaskSortNumber asc';
}

{
  "MainPage": "/SAPAssetManager/Pages/Overview.page",
  "_Name": "SAPAssetManager",
  "Version": "4.0.3",
  "OnWillUpdate": "/SAPAssetManager/Rules/ApplicationEvents/ApplicationOnWillUpdate.js",
  "OnDidUpdate": "/SAPAssetManager/Rules/ApplicationEvents/ApplicationOnDidUpdate.js",
  "OnLaunch": [
    "/SAPAssetManager/Actions/OData/InitializeOfflineOData.action",
    "/SAPAssetManager/Rules/Log/InitializeLogger.js",
    "/SAPAssetManager/Rules/Sync/InitializeSyncState.js"
  ],
   "SDKStyles": "/SAPAssetManager/Styles/SDKStyles.nss",
   "Styles": "/SAPAssetManager/Styles/Styles.css",
   "Localization": "/SAPAssetManager/i18n/i18n.properties",
   "OnReceiveForegroundNotification" : "/SAPAssetManager/Rules/PushNotifications/PushNotificationsForegroundNotificationEventHandler.js",
   "OnReceiveFetchCompletion" : "/SAPAssetManager/Rules/PushNotifications/PushNotificationsContentAvailableEventHandler.js",
   "OnReceiveNotificationResponse" : "/SAPAssetManager/Rules/PushNotifications/PushNotificationsReceiveNotificationResponseEventHandler.js"

}

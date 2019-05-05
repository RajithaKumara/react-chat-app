navigator.serviceWorker.register('service-worker.js').then(function (registration) {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
}, function (err) {
    console.log('ServiceWorker registration failed: ', err);
});

const DEFAULT_NOTIFICATION_TAG = 'react-chat';
var isNotificationPermitted = false;
var isWindowActive = false;

Notification.requestPermission(function (result) {
    if (result === 'granted') {
        isNotificationPermitted = true;
    }
});

window.addEventListener('focus', function () {
    isWindowActive = true;
    closeNotifications();
});

window.addEventListener('blur', function () {
    isWindowActive = false;
});

function showNotification(title, body, tag = DEFAULT_NOTIFICATION_TAG) {
    var options = {
        body,
        tag,
        icon: 'images/notification/badge-192x192.png',
        badge: 'images/notification/badge-96x96.png',
        renotify: true,
    }

    if (isNotificationPermitted && !isWindowActive) {
        navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification(title, options);
        }).catch(function (error) {
        });
    }
}

function closeNotifications(tag = DEFAULT_NOTIFICATION_TAG) {
    var options = { tag };

    navigator.serviceWorker.ready.then(function (registration) {
        registration.getNotifications(options).then(function (notifications) {
            notifications.forEach(notification => {
                notification.close();
            });
        })
    });
}

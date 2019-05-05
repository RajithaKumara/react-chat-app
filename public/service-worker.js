self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) { });

self.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    setTimeout(function () {
        event.prompt();
    }, 5000);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(async function () {
        const allClients = await clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        });

        let chatClient;
        for (const client of allClients) {
            const url = new URL(client.url);

            if (url.pathname == '/') {
                client.focus();
                chatClient = client;
                break;
            }
        }
        if (!chatClient) {
            chatClient = await clients.openWindow('/');
        }
    }());
});

self.addEventListener('push', function(event) {
  let data = {}
  try{ data = event.data.json() }catch(e){ data = { title: 'Bluephes', body: event.data ? event.data.text() : 'You have a reminder' } }
  const title = data.title || 'Bluephes Reminder'
  const options = { body: data.body || 'A reminder from Bluephes', tag: data.tag || 'bluephes-reminder', data: data }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event){
  event.notification.close()
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/'
  event.waitUntil(clients.openWindow(url))
})

// simple message handler for test
self.addEventListener('message', function(event){
  if(event.data && event.data.type === 'test'){
    self.registration.showNotification('Bluephes (test)', { body: 'This is a test notification' })
  }
})

chrome.runtime.sendMessage({type: 'complete'});

chrome.storage.sync.get(['name', 'email', 'tel', 'update_delay', 'send_delay', 'forced_reload', 'location_id', 'start_time', 'request', 'private_webhook_url'], function(res){
  if (res.forced_reload != '0') {
    setTimeout (() => {
      location.reload();
    }, res.forced_reload);
  }
});

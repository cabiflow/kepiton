chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('kepiton-pinned-deadline', {
    periodInMinutes: 5,
  });
});

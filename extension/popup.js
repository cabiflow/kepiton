const messages = {
  title: 'Kepiton',
  emptyState: 'Chưa có deadline nào được ghim.',
};

document.querySelectorAll('[data-i18n]').forEach((element) => {
  const key = element.getAttribute('data-i18n');
  if (key && messages[key]) {
    element.textContent = messages[key];
  }
});

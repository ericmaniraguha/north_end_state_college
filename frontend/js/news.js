// News & Events page: all news, upcoming events and important dates.

(async () => {
  const safe = (request) => request.catch(() => null);
  const [news, events, dates] = await Promise.all([
    safe(api('/api/posts?type=news&limit=50')),
    safe(api('/api/posts?type=event&limit=20')),
    safe(api('/api/calendar?limit=50')),
  ]);

  renderList(document.getElementById('news-list'), news, (p) => newsCard(p, true), 'No news yet. Check back soon.');
  renderList(document.getElementById('events-list'), events, eventItem, 'No upcoming events.');
  renderList(document.getElementById('dates-list'), dates, dateItem, 'No upcoming dates.');

  // Open a linked post (e.g. /news#post-3) once it has been rendered
  const target = location.hash && document.querySelector(location.hash);
  if (target) {
    target.querySelector('details')?.setAttribute('open', '');
    target.scrollIntoView();
  }
})();

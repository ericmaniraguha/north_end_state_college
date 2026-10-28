import { useLocation } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { DateItem, EventItem, ListState, NewsCard } from '../../components/cards.jsx';
import { PageHero } from '../../components/sections.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { getCalendar, getEvents, getNews } from '../../services/publicApi.js';

export default function NewsPage() {
  usePageMeta('News and Events | North End College, Lusaka', 'The latest news, upcoming events and important dates at North End College, Lusaka, Zambia.');
  const { hash } = useLocation();
  const news = useApi(() => getNews(50), []);
  const events = useApi(() => getEvents(20), []);
  const dates = useApi(() => getCalendar(50), []);

  return (
    <>
      <PageHero crumbs={[['News and Events']]} title="News and Events">
        <p>College updates, upcoming events and important dates.</p>
      </PageHero>

      <section className="section">
        <div className="container news-layout">
          <div id="news">
            <h2>Latest news</h2>
            <ListState
              state={news}
              className="news-grid"
              empty="No news yet. Check back soon."
              render={(post) => <NewsCard key={post.id} post={post} full open={hash === `#post-${post.id}`} />}
            />
          </div>
          <aside>
            <div id="events" className="side-block">
              <h3><Icon name="calendar" />Upcoming events</h3>
              <ListState state={events} empty="No upcoming events." render={(e) => <EventItem key={e.id} event={e} />} />
            </div>
            <div id="dates" className="side-block">
              <h3>Important dates</h3>
              <ListState state={dates} as="ul" className="date-list" empty="No upcoming dates." render={(d) => <DateItem key={d.id} item={d} />} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

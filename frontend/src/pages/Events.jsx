import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import eventService from '../services/eventService';
import useAuthStore from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';

const CATEGORIES = ['ALL', 'DEBATE', 'QUIZ', 'SCIENCE', 'SPORTS', 'ARTS', 'OTHER'];
const STATUSES = ['ALL', 'DRAFT', 'PUBLISHED', 'OPEN', 'ONGOING', 'COMPLETED'];
const statusColor = {
  DRAFT: 'bg-dark-700 text-dark-400',
  PUBLISHED: 'bg-blue-500/20 text-blue-400',
  OPEN: 'bg-green-500/20 text-green-400',
  ONGOING: 'bg-yellow-500/20 text-yellow-400',
  COMPLETED: 'bg-purple-500/20 text-purple-400',
};

const Events = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  useScrollReveal();

  const fetchEvents = () => {
    setLoading(true);
    const params = {};
    if (category !== 'ALL') params.category = category;
    if (status !== 'ALL') params.status = status;
    if (search) params.search = search;
    eventService.getAll(params).then(res => setEvents(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [category, status]);

  return (
    <Layout>
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-6 reveal'>
          <div>
            <h1 className='font-display font-bold text-2xl text-dark-50'>Events</h1>
            <p className='text-dark-400 text-sm mt-1'>{events.length} events found</p>
          </div>
          {user?.role === 'SCHOOL' && (
            <Link to='/events/create' className='px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-glow'>
              + Create Event
            </Link>
          )}
        </div>
        <div className='flex flex-wrap gap-3 mb-6 reveal delay-1'>
          <input type='text' placeholder='Search events...' value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchEvents()}
            className='input max-w-xs' />
          <select value={category} onChange={e => setCategory(e.target.value)} className='input max-w-[160px]'>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className='input max-w-[160px]'>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <Loader /> : events.length === 0 ? (
          <div className='text-center py-20 text-dark-500 reveal'>No events found.</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {events.map((event, i) => (
              <Link key={event.id} to={'/events/' + event.id} className={`card-hover group reveal delay-${Math.min((i % 8) + 1, 8)}`}>
                <div className='flex items-start justify-between mb-3'>
                  <span className='text-xs font-medium px-2 py-1 rounded-full bg-brand-500/20 text-brand-400'>{event.category}</span>
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (statusColor[event.status] || '')}>{event.status}</span>
                </div>
                <h3 className='font-semibold text-dark-100 group-hover:text-brand-400 transition-colors mt-2'>{event.title}</h3>
                <p className='text-xs text-dark-500 mt-1'>{event.school?.name} — {event.school?.location}</p>
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-dark-800 text-xs text-dark-500'>
                  <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                  <span>👥 {event._count?.registrations || 0} registered</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Events;

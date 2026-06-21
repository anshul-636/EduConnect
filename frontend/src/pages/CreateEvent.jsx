import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import eventService from '../services/eventService';

const CATEGORIES = ['DEBATE', 'QUIZ', 'SCIENCE', 'SPORTS', 'ARTS', 'OTHER'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'OPEN'];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'DEBATE', eventDate: '', regDeadline: '', teamSize: 1, maxTeams: '', status: 'DRAFT', subjectTags: '',
    targetClass: '', location: '', eventTime: '', prizePool: '', firstPrize: '', secondPrize: '', thirdPrize: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      // Combine separate date and time fields into a single ISO datetime
      const eventDateTime = form.eventDate && form.eventTime
        ? new Date(`${form.eventDate}T${form.eventTime}`).toISOString()
        : form.eventDate ? new Date(form.eventDate).toISOString() : '';
      const payload = {
        ...form,
        eventDate: eventDateTime,
        teamSize: parseInt(form.teamSize) || 1,
        maxTeams: form.maxTeams ? parseInt(form.maxTeams) : null,
        subjectTags: form.subjectTags ? form.subjectTags.split(',').map(t => t.trim()) : []
      };
      const res = await eventService.create(payload);
      navigate('/events/' + res.data.id);
    } catch (err) { setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className='max-w-2xl mx-auto'>
        <button onClick={() => navigate('/events')} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Events</button>
        <h1 className='font-display font-bold text-2xl text-dark-50 mb-1'>Create Event</h1>
        <p className='text-dark-400 text-sm mb-8'>Fill in the details for your new event.</p>
        <div className='card'>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Event Title *</label><input name='title' value={form.title} onChange={handleChange} className='input' placeholder='Inter School Debate 2026' required /></div>

            <div className='grid grid-cols-2 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Category *</label><select name='category' value={form.category} onChange={handleChange} className='input' required>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Target Class / Audience *</label><input name='targetClass' value={form.targetClass} onChange={handleChange} className='input' placeholder='Class 9-12' required /></div>
            </div>

            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Event Description & Rules *</label><textarea name='description' value={form.description} onChange={handleChange} className='input min-h-[100px] resize-none' placeholder='Describe what the event is based on and its rules...' required /></div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Event Date *</label><input type='date' name='eventDate' value={form.eventDate} onChange={handleChange} className='input' required /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Event Time *</label><input type='time' name='eventTime' value={form.eventTime} onChange={handleChange} className='input' required /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Location / Venue *</label><input name='location' value={form.location} onChange={handleChange} className='input' placeholder='Auditorium' required /></div>
            </div>

            <div className='p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4'>
              <h3 className='font-semibold text-dark-100'>Prize Details</h3>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Total Prize Pool *</label><input name='prizePool' value={form.prizePool} onChange={handleChange} className='input' placeholder='₹10,000' required /></div>
              <div className='grid grid-cols-3 gap-3'>
                <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>1st Prize *</label><input name='firstPrize' value={form.firstPrize} onChange={handleChange} className='input' placeholder='₹5,000' required /></div>
                <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>2nd Prize *</label><input name='secondPrize' value={form.secondPrize} onChange={handleChange} className='input' placeholder='₹3,000' required /></div>
                <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>3rd Prize *</label><input name='thirdPrize' value={form.thirdPrize} onChange={handleChange} className='input' placeholder='₹2,000' required /></div>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Team Size *</label><input type='number' name='teamSize' value={form.teamSize} onChange={handleChange} className='input' min={1} max={10} required /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Max Teams</label><input type='number' name='maxTeams' value={form.maxTeams} onChange={handleChange} className='input' placeholder='Unlimited' min={1} /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Reg Deadline</label><input type='date' name='regDeadline' value={form.regDeadline} onChange={handleChange} className='input' /></div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Status *</label><select name='status' value={form.status} onChange={handleChange} className='input' required>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Subject Tags <span className='text-dark-500 font-normal'>(comma separated)</span></label><input name='subjectTags' value={form.subjectTags} onChange={handleChange} className='input' placeholder='physics, chemistry' /></div>
            </div>

            <button type='submit' disabled={loading} className='btn-primary mt-4 w-full'>{loading ? 'Creating...' : 'Publish Event'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default CreateEvent;

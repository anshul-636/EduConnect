import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import schoolService from '../../services/schoolService';

const SchoolManage = () => {
  const [school, setSchool] = useState(null);
  const [form, setForm] = useState({ name:'', location:'', affiliation:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text:'', ok:false });
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    schoolService.getMySchool()
      .then(res => { setSchool(res.data); setForm({ name:res.data.name, location:res.data.location||'', affiliation:res.data.affiliation||'' }); })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setMsg({ text:'', ok:false });
    try {
      if (isNew) { const res = await schoolService.create(form); setSchool(res.data); setIsNew(false); setMsg({ text:'School created!', ok:true }); }
      else { const res = await schoolService.update(school.id, form); setSchool(res.data); setMsg({ text:'School updated!', ok:true }); }
    } catch (err) { setMsg({ text:err.response?.data?.message||'Error.', ok:false }); }
    finally { setSaving(false); }
  };

  return (
    <Layout>
      <div className='max-w-2xl mx-auto'>
        <h1 className='font-display font-bold text-2xl text-dark-50 mb-1'>{isNew?'Create Your School':'Manage School'}</h1>
        <p className='text-dark-400 text-sm mb-8'>{isNew?'Set up your school profile.':'Update your school information.'}</p>
        {loading ? <div className='text-dark-400 text-sm'>Loading...</div> : (
          <div className='card'>
            {msg.text && (
              <div className={'mb-4 px-4 py-3 rounded-xl text-sm ' + (msg.ok?'bg-green-500/10 border border-green-500/30 text-green-400':'bg-red-500/10 border border-red-500/30 text-red-400')}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>School Name</label><input name='name' value={form.name} onChange={handleChange} className='input' placeholder='Delhi Public School' required /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Location</label><input name='location' value={form.location} onChange={handleChange} className='input' placeholder='New Delhi, India' /></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Affiliation</label>
                <select name='affiliation' value={form.affiliation} onChange={handleChange} className='input'>
                  <option value=''>Select affiliation</option>
                  <option>CBSE</option><option>ICSE</option><option>State Board</option><option>IB</option><option>Other</option>
                </select>
              </div>
              <button type='submit' disabled={saving} className='btn-primary'>{saving?'Saving...':isNew?'Create School':'Save Changes'}</button>
            </form>
            {!isNew && school && (
              <div className='mt-6 pt-6 border-t border-dark-800 grid grid-cols-3 gap-3'>
                {[{label:'Members',value:school._count?.members||0},{label:'Events',value:school._count?.events||0},{label:'Resources',value:school._count?.resources||0}].map(s => (
                  <div key={s.label} className='bg-dark-800 rounded-xl p-3 text-center'>
                    <p className='font-bold text-xl text-brand-400'>{s.value}</p>
                    <p className='text-xs text-dark-500'>{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default SchoolManage;

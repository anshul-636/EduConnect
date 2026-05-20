import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import resourceService from '../services/resourceService';

const TYPES = ['PDF','VIDEO','LINK','NOTES'];
const DIFFICULTIES = ['BEGINNER','INTERMEDIATE','ADVANCED'];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','History','Geography','Computer Science','Other'];

const UploadResource = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'',description:'',type:'PDF',subject:'',topic:'',difficulty:'BEGINNER',fileUrl:'' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k,v]) => { if(v) formData.append(k,v); });
      if (file) formData.append('file', file);
      const res = await resourceService.upload(formData);
      navigate('/resources/' + res.data.id);
    } catch (err) { setError(err.response?.data?.message||err.response?.data?.errors?.[0]?.msg||'Upload failed.'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className='max-w-2xl mx-auto'>
        <button onClick={() => navigate('/resources')} className='text-dark-400 hover:text-dark-100 text-sm mb-6'>← Back to Resources</button>
        <h1 className='font-display font-bold text-2xl text-dark-50 mb-1'>Upload Resource</h1>
        <p className='text-dark-400 text-sm mb-8'>Share study material with students across schools.</p>
        <div className='card'>
          {error && <div className='mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm'>{error}</div>}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Title</label><input name='title' value={form.title} onChange={handleChange} className='input' placeholder='Physics Chapter 5 Notes' required /></div>
            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Description</label><textarea name='description' value={form.description} onChange={handleChange} className='input min-h-[80px] resize-none' placeholder='What is this resource about?' /></div>
            <div className='grid grid-cols-2 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Type</label><select name='type' value={form.type} onChange={handleChange} className='input'>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Difficulty</label><select name='difficulty' value={form.difficulty} onChange={handleChange} className='input'>{DIFFICULTIES.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Subject</label><select name='subject' value={form.subject} onChange={handleChange} className='input'><option value=''>Select subject</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Topic</label><input name='topic' value={form.topic} onChange={handleChange} className='input' placeholder='e.g. Thermodynamics' /></div>
            </div>
            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Upload File <span className='text-dark-500 font-normal'>(max 50MB)</span></label><input type='file' accept='.pdf,.jpg,.jpeg,.png,.mp4' onChange={e=>setFile(e.target.files[0])} className='input py-2' /></div>
            <div><label className='block text-sm font-medium text-dark-300 mb-1.5'>Or paste URL</label><input name='fileUrl' value={form.fileUrl} onChange={handleChange} className='input' placeholder='https://youtube.com/...' /></div>
            <button type='submit' disabled={loading} className='btn-primary'>{loading?'Uploading...':'Upload Resource'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default UploadResource;

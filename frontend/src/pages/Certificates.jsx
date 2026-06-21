import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import Loader from '../components/common/Loader';
import certificateService from '../services/certificateService';
import { useScrollReveal } from '../hooks/useScrollReveal';

const typeStyle = {
  WINNER: { gradient: 'from-yellow-500 to-amber-600', icon: '🥇', label: 'Winner' },
  RUNNER_UP: { gradient: 'from-slate-500 to-slate-600', icon: '🥈', label: 'Runner Up' },
  PARTICIPATION: { gradient: 'from-brand-500 to-purple-600', icon: '🏅', label: 'Participation' },
};

const Certificates = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    certificateService.getMyCertificates()
      .then(res => setCerts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDownload = (certId) => {
    const token = localStorage.getItem('accessToken');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    window.open(base + '/certificates/download/' + certId + '?token=' + token, '_blank');
  };

  return (
    <Layout>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 reveal'>
          <h1 className='font-display font-bold text-2xl text-dark-50'>My Certificates</h1>
          <p className='text-dark-400 text-sm mt-1'>{certs.length} certificates earned</p>
        </div>
        {loading ? <Loader /> : certs.length === 0 ? (
          <div className='text-center py-20 text-dark-500 reveal'>
            <p className='text-4xl mb-3'>🏅</p>
            <p>No certificates yet. Participate in events to earn them!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {certs.map((cert, i) => {
              const style = typeStyle[cert.type] || typeStyle.PARTICIPATION;
              return (
                <div key={cert.id} className={'rounded-2xl p-6 text-white bg-gradient-to-br reveal-scale delay-' + Math.min((i % 8) + 1, 8) + ' ' + style.gradient}>
                  <div className='flex items-start justify-between mb-3'>
                    <span className='text-3xl'>{style.icon}</span>
                    <span className='text-xs font-semibold px-2 py-1 rounded-full bg-white/20'>{style.label}</span>
                  </div>
                  <h3 className='font-semibold text-white mb-1'>{cert.event?.title}</h3>
                  <p className='text-white/70 text-xs mb-4'>{cert.event?.category}</p>
                  <div className='flex items-center justify-between text-xs text-white/60 mb-4'>
                    <span>📅 {cert.event && new Date(cert.event.eventDate).toLocaleDateString()}</span>
                    <span>Issued {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => handleDownload(cert.id)}
                    className='block w-full text-center py-2 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all'>
                    📄 Download Certificate PDF
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Certificates;

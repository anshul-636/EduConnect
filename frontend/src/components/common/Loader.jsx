const Loader = ({ text = 'Loading...' }) => (
  <div className='flex flex-col items-center justify-center min-h-[200px] gap-3'>
    <div className='w-8 h-8 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin' />
    <p className='text-sm text-dark-500'>{text}</p>
  </div>
);
export default Loader;

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import resourceService from '../services/resourceService';
import useAuthStore from '../store/authStore';
import { useScrollReveal } from '../hooks/useScrollReveal';

const TYPES = ['', 'PDF', 'VIDEO', 'LINK', 'NOTES'];
const DIFFICULTIES = ['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TypeBadge = ({ type }) => {
  const colors = {
    PDF: 'bg-red-900/40 text-red-300',
    VIDEO: 'bg-purple-900/40 text-purple-300',
    LINK: 'bg-blue-900/40 text-blue-300',
    NOTES: 'bg-yellow-900/40 text-yellow-300',
  };
  return (
    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (colors[type] || 'bg-dark-700 text-dark-400')}>
      {type}
    </span>
  );
};

const DifficultyBadge = ({ level }) => {
  const colors = {
    BEGINNER: 'text-green-400',
    INTERMEDIATE: 'text-yellow-400',
    ADVANCED: 'text-red-400',
  };
  return <span className={'text-xs font-medium ' + (colors[level] || 'text-dark-400')}>{level}</span>;
};

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Resources() {
  const { user } = useAuthStore();
  useScrollReveal();

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const LIMIT = 18;

  // Data state
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-resource upvote state (optimistic UI)
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [upvotingId, setUpvotingId] = useState(null);

  // FIXED: Debounce the search so typing doesn't fire a request on every keystroke
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter, difficultyFilter, subjectFilter]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (typeFilter) params.type = typeFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (subjectFilter) params.subject = subjectFilter;

      const res = await resourceService.getAll(params);
      const payload = res.data;

      // Support both paginated ({items, pagination}) and legacy (array) responses
      if (Array.isArray(payload.data)) {
        setResources(payload.data);
        setPagination(null);
      } else {
        setResources(payload.items || payload.data?.items || []);
        setPagination(payload.pagination || payload.data?.pagination || null);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, difficultyFilter, subjectFilter, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleUpvote = async (e, resourceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (upvotingId) return;
    setUpvotingId(resourceId);
    try {
      const res = await resourceService.upvote(resourceId);
      const { upvoted, upvotes } = res.data.data;

      setUpvotedIds((prev) => {
        const next = new Set(prev);
        if (upvoted) next.add(resourceId);
        else next.delete(resourceId);
        return next;
      });

      // Optimistic update in list
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, upvotes } : r))
      );
    } catch (err) {
      console.error('Upvote failed:', err);
    } finally {
      setUpvotingId(null);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setTypeFilter('');
    setDifficultyFilter('');
    setSubjectFilter('');
    setPage(1);
  };

  const hasFilters = searchInput || typeFilter || difficultyFilter || subjectFilter;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 reveal">
          <div>
            <h1 className="font-display font-bold text-2xl text-dark-50">Resource Library</h1>
            <p className="text-dark-400 mt-1">
              {pagination ? `${pagination.total} resources` : 'Browse study materials'}
            </p>
          </div>
          {(user?.role === 'SCHOOL' || user?.role === 'TEACHER') && (
            <Link
              to="/resources/upload"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <span>+</span> Upload Resource
            </Link>
          )}
        </div>

        {/* FIXED: Search bar — now debounced, triggers on every keystroke after 400ms */}
        <div className="flex gap-3 mb-4 flex-wrap reveal delay-1">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search resources… (auto-searches as you type)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-500"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-dark-200 focus:outline-none focus:border-brand-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t || 'All Types'}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-dark-200 focus:outline-none focus:border-brand-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d || 'All Levels'}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-brand-500 w-32"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs text-dark-400 hover:text-dark-200 border border-dark-600 rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-dark-800 rounded-2xl h-40" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-3">Failed to load resources: {error}</p>
            <button onClick={fetchResources} className="btn-secondary text-sm">Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-dark-400 text-lg">
              {hasFilters ? 'No resources match your filters.' : 'No resources uploaded yet.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-brand-400 hover:text-brand-300 text-sm">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Resource grid */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource, i) => (
              <Link
                key={resource.id}
                to={`/resources/${resource.id}`}
                className={`group block rounded-2xl bg-dark-800 border border-dark-700 hover:border-brand-500/50 transition-all p-5 reveal delay-${Math.min((i % 8) + 1, 8)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <TypeBadge type={resource.type} />
                  <DifficultyBadge level={resource.difficulty} />
                </div>

                <h3 className="font-semibold text-dark-100 group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className="text-dark-500 text-xs line-clamp-2 mb-3">{resource.description}</p>
                )}

                {(resource.subject || resource.topic) && (
                  <p className="text-dark-500 text-xs mb-3">
                    {[resource.subject, resource.topic].filter(Boolean).join(' • ')}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-dark-500 text-xs">
                    by {resource.uploader?.name || 'Unknown'}
                  </span>

                  <div className="flex items-center gap-3 text-dark-500 text-xs">
                    <span>👁 {resource.viewCount ?? 0}</span>
                    <button
                      onClick={(e) => handleUpvote(e, resource.id)}
                      disabled={!!upvotingId}
                      className={`flex items-center gap-1 transition-colors hover:text-brand-400 ${upvotedIds.has(resource.id) ? 'text-brand-400' : ''
                        }`}
                    >
                      <span>{upvotedIds.has(resource.id) ? '👍' : '👍'}</span>
                      <span>{resource.upvotes ?? 0}</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 text-sm rounded-xl border border-dark-600 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="text-dark-500 px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-xl border transition-colors ${p === page
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'border-dark-600 text-dark-300 hover:bg-dark-700'
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 text-sm rounded-xl border border-dark-600 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

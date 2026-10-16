import { useEffect, useState } from 'react';
import axios from '../axiosConfig';

interface Alumni {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  class?: string;
  passoutYear?: number;
  tags?: string[];
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  useEffect(() => {
    axios.get<Alumni[]>('/users/alumni')
      .then(({ data }) => setAlumni(data))
      .catch((err) => {
        console.error('Error fetching alumni', err);
        setError('Could not load alumni. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(alumni
    .map((person) => person.passoutYear)
    .filter((year): year is number => typeof year === 'number'))).sort((a, b) => b - a);
  const classes = Array.from(new Set(alumni
    .map((person) => person.class)
    .filter((value): value is string => Boolean(value)))).sort();
  const tags = Array.from(new Set(alumni.flatMap((person) => person.tags ?? []))).sort((a, b) => a.localeCompare(b));
  const searchTerm = search.trim().toLowerCase();
  const filteredAlumni = alumni.filter((person) => {
    const matchesSearch = !searchTerm || [person.name, person.email, ...(person.tags ?? [])]
      .some((value) => value.toLowerCase().includes(searchTerm));
    return matchesSearch
      && (yearFilter === 'all' || String(person.passoutYear ?? '') === yearFilter)
      && (classFilter === 'all' || person.class === classFilter)
      && (tagFilter === 'all' || person.tags?.includes(tagFilter));
  });
  const hasFilters = Boolean(search || yearFilter !== 'all' || classFilter !== 'all' || tagFilter !== 'all');

  const clearFilters = () => {
    setSearch('');
    setYearFilter('all');
    setClassFilter('all');
    setTagFilter('all');
  };

  const saveTags = async (person: Alumni) => {
    const nextTags = (drafts[person._id] ?? (person.tags ?? []).join(', '))
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSavingId(person._id);
    setError('');
    try {
      const { data } = await axios.patch(`/users/${person._id}/tags`, { tags: nextTags });
      setAlumni((current) => current.map((item) => item._id === person._id ? { ...item, tags: data.tags } : item));
      setDrafts((current) => ({ ...current, [person._id]: (data.tags ?? []).join(', ') }));
    } catch (err) {
      console.error('Error updating alumni tags', err);
      setError(`Could not update tags for ${person.name}. Check the tag format and try again.`);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="alumni-page min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center text-white">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 mb-0">Loading alumni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-page min-vh-100">
      <div className="container-fluid px-4 py-5">
        <header className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <h1 className="display-5 fw-bold alumni-title mb-2">Alumni</h1>
            <p className="lead text-white-50 mb-0">Former students and their FHC roles</p>
          </div>
          <div className="alumni-count" aria-live="polite">
            <strong>{filteredAlumni.length}</strong>
            <span>shown of {alumni.length} alumni</span>
          </div>
        </header>

        {error && <div className="alert alumni-alert" role="alert">{error}</div>}

        <section className="alumni-filters mb-4" aria-label="Search and filter alumni">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label" htmlFor="alumni-search">Search</label>
              <input
                id="alumni-search"
                className="form-control alumni-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, email, or tag"
              />
            </div>
            <div className="col-12 col-sm-4 col-lg-2">
              <label className="form-label" htmlFor="alumni-year-filter">Pass-out year</label>
              <select id="alumni-year-filter" className="form-select alumni-control" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option value="all">All years</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-4 col-lg-2">
              <label className="form-label" htmlFor="alumni-class-filter">Class</label>
              <select id="alumni-class-filter" className="form-select alumni-control" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="all">All classes</option>
                {classes.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-4 col-lg-2">
              <label className="form-label" htmlFor="alumni-tag-filter">Tag</label>
              <select id="alumni-tag-filter" className="form-select alumni-control" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="all">All tags</option>
                {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            <div className="col-12 col-lg-2 d-grid">
              <button className="btn alumni-clear-btn" onClick={clearFilters} disabled={!hasFilters}>Clear filters</button>
            </div>
          </div>
        </section>

        {!alumni.length ? (
          <div className="alumni-empty">No alumni found.</div>
        ) : !filteredAlumni.length ? (
          <div className="alumni-empty">No alumni match these filters. Try changing your search.</div>
        ) : (
          <div className="row g-4">
            {filteredAlumni.map((person, index) => (
              <div className="col-12 col-md-6 col-xl-4" key={person._id}>
                <article className="alumni-card h-100" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="alumni-card-head">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      {person.profilePic ? (
                        <img src={person.profilePic} alt="" className="alumni-avatar" />
                      ) : (
                        <div className="alumni-avatar alumni-avatar-fallback">{person.name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div className="min-w-0">
                        <h2 className="h5 text-white mb-2 text-truncate">{person.name}</h2>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="alumni-badge">Alumni</span>
                          {person.passoutYear && <span className="alumni-badge alumni-year">Pass-out {person.passoutYear}</span>}
                          {person.class && <span className="alumni-badge alumni-class">{person.class}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alumni-card-body">
                    <div className="alumni-contact">
                      <a href={`mailto:${person.email}`}>{person.email}</a>
                      {person.phone && <a href={`tel:${person.phone}`}>{person.phone}</a>}
                    </div>

                    <div className="alumni-tags mb-3">
                      {(person.tags ?? []).map((tag) => <span className="alumni-tag" key={tag}>{tag}</span>)}
                      {!person.tags?.length && <span className="text-white-50 small">No tags yet</span>}
                    </div>

                    <label className="form-label small text-white-50 mb-1" htmlFor={`alumni-tags-${person._id}`}>Admin tags, comma-separated</label>
                    <div className="input-group input-group-sm">
                      <input
                        id={`alumni-tags-${person._id}`}
                        className="form-control alumni-control"
                        value={drafts[person._id] ?? (person.tags ?? []).join(', ')}
                        onChange={(event) => setDrafts((current) => ({ ...current, [person._id]: event.target.value }))}
                        placeholder="Founder, Ex-Chair"
                        maxLength={409}
                      />
                      <button className="btn alumni-save-btn" onClick={() => saveTags(person)} disabled={savingId === person._id}>
                        {savingId === person._id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .alumni-page { background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); color: #fff; }
        .alumni-title { background: linear-gradient(90deg, #00d4ff, #ff6bcb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .alumni-count { display: flex; align-items: baseline; gap: 9px; padding: 12px 18px; border: 1px solid rgba(0,212,255,.3); border-radius: 16px; background: rgba(255,255,255,.08); color: rgba(255,255,255,.72); }
        .alumni-count strong { color: #00d4ff; font-size: 1.5rem; }
        .alumni-filters { padding: 20px; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: rgba(255,255,255,.08); backdrop-filter: blur(16px); }
        .alumni-filters .form-label { color: rgba(255,255,255,.72); font-size: .85rem; }
        .alumni-control { color: #fff; border-color: rgba(255,255,255,.2); background-color: rgba(10,12,35,.7); }
        .alumni-control::placeholder { color: rgba(255,255,255,.45); }
        .alumni-control:focus { color: #fff; border-color: #00d4ff; background-color: rgba(10,12,35,.9); box-shadow: 0 0 0 .2rem rgba(0,212,255,.18); }
        .alumni-control option { color: #111827; background: #fff; }
        .alumni-clear-btn { border: 1px solid rgba(255,255,255,.25); color: #fff; background: rgba(255,255,255,.08); }
        .alumni-clear-btn:hover:not(:disabled) { border-color: #00d4ff; color: #00d4ff; }
        .alumni-clear-btn:disabled { color: rgba(255,255,255,.35); border-color: rgba(255,255,255,.1); }
        .alumni-card { overflow: hidden; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.06)); box-shadow: 0 10px 32px rgba(0,0,0,.18); animation: alumniFadeUp .45s ease-out both; transition: transform .2s ease, border-color .2s ease; }
        .alumni-card:hover { transform: translateY(-4px); border-color: rgba(0,212,255,.42); }
        .alumni-card-head { padding: 20px; border-bottom: 1px solid rgba(0,212,255,.24); background: linear-gradient(135deg, rgba(0,212,255,.1), rgba(255,107,203,.05)); }
        .alumni-card-body { padding: 20px; }
        .alumni-avatar { width: 58px; height: 58px; flex: 0 0 58px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,212,255,.7); }
        .alumni-avatar-fallback { display: flex; align-items: center; justify-content: center; color: #07111e; background: linear-gradient(135deg, #00d4ff, #ff6bcb); font-weight: 700; font-size: 1.4rem; }
        .alumni-badge, .alumni-tag { display: inline-flex; align-items: center; border: 1px solid rgba(0,212,255,.35); border-radius: 999px; padding: 4px 10px; color: #a5f3fc; background: rgba(0,212,255,.1); font-size: .75rem; font-weight: 600; }
        .alumni-year { border-color: rgba(255,107,203,.38); color: #fbcfe8; background: rgba(255,107,203,.1); }
        .alumni-class { color: #ddd6fe; border-color: rgba(167,139,250,.38); background: rgba(167,139,250,.1); }
        .alumni-contact { display: grid; gap: 7px; margin-bottom: 16px; font-size: .9rem; }
        .alumni-contact a { color: rgba(255,255,255,.78); text-decoration: none; overflow-wrap: anywhere; }
        .alumni-contact a:hover { color: #00d4ff; }
        .alumni-tags { display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px; }
        .alumni-save-btn { border: 0; color: #07111e; font-weight: 700; background: linear-gradient(90deg, #00d4ff, #ff6bcb); }
        .alumni-save-btn:disabled { opacity: .65; }
        .alumni-alert, .alumni-empty { padding: 16px 20px; border: 1px solid rgba(255,255,255,.16); border-radius: 14px; color: rgba(255,255,255,.82); background: rgba(255,255,255,.08); }
        .alumni-alert { border-color: rgba(248,113,113,.4); color: #fecaca; background: rgba(127,29,29,.35); }
        @keyframes alumniFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .alumni-card { animation: none; transition: none; } }
      `}</style>
    </div>
  );
}

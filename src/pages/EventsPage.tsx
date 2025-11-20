// src/pages/EventsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Note: In your actual file, keep your original import: import axios from '../axiosConfig';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import axios from '../axiosConfig';

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredUsers: string[];
  tags: string[];
  category: string;
  registrationStatus?: string;
}

const categoryColors: Record<string, string> = {
  Workshop: '#a855f7',
  Event: '#3b82f6',
  Webinar: '#ec4899',
  Conference: '#6366f1',
  Meetup: '#14b8a6',
  Seminar: '#f59e0b',
  Training: '#10b981',
  Other: '#94a3b8',
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Event',
    date: '',
    time: '09:00',
    location: '',
    capacity: 50,
    tags: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<EventType[]>('/events/getEvents', { withCredentials: true });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  const handleAddEvent = async () => {
    const payload = {
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || '',
      category: newEvent.category,
      date: newEvent.date,
      time: newEvent.time || '09:00',
      location: newEvent.location.trim() || 'TBA',
      capacity: Number(newEvent.capacity) || 50,
      tags: newEvent.tags ? newEvent.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (!payload.title || !payload.date || !payload.category) {
      alert('Title, Date and Category are required!');
      return;
    }

    try {
      await axios.post('/events/addEvent', payload, { withCredentials: true });
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', category: 'Event', date: '', time: '09:00', location: '', capacity: 50, tags: '' });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await axios.put(`/events/${eventId}/status`, { status });
      setEvents(prev => prev.map(e => (e._id === eventId ? { ...e, registrationStatus: status } : e)));
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = (event: EventType) => {
    setEventToDelete(event);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(`/events/${eventToDelete._id}/delete`);
      setEvents(prev => prev.filter(e => e._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];
  const filteredEvents = selectedCategory === 'All' ? events : events.filter(e => e.category === selectedCategory);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-cyan" style={{ width: '4.5rem', height: '4.5rem' }} />
          <p className="mt-4 fs-4 text-white opacity-75">Loading Events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="container-fluid px-4 py-5">

          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-gradient mb-3">Events Management</h1>
            <p className="lead text-white opacity-80">Create, manage and track all club events</p>
          </div>

          {/* FILTERS - IMPROVED VISIBILITY */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <div className="text-center mb-5">
            <button
              onClick={() => setShowAddModal(true)}
              className="add-event-btn"
            >
              <Plus size={24} /> Add New Event
            </button>
          </div>

          {/* EVENTS GRID - REDESIGNED CARDS */}
          <div className="row g-4">
            {filteredEvents.map((event, idx) => {
              const attendees = event.registeredUsers?.length || 0;
              const percentage = event.capacity > 0 ? Math.round((attendees / event.capacity) * 100) : 0;
              const color = categoryColors[event.category] || '#94a3b8';

              return (
                <div key={event._id} className="col-12 col-md-6 col-xl-4">
                  <div
                    className="event-card h-100"
                    style={{
                      animation: `fadeUp 0.6s ease-out forwards`,
                      animationDelay: `${idx * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    {/* Card Header with Category Badge */}
                    <div className="event-card-header" style={{ 
                      background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
                      borderBottom: `2px solid ${color}66`
                    }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <h3 className="event-title text-white mb-0">
                          {event.title}
                        </h3>
                        <span className="category-badge" style={{ 
                          background: color,
                          boxShadow: `0 4px 15px ${color}66`
                        }}>
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="event-card-body">
                      {/* Description */}
                      <p className="event-description text-white-50">
                        {event.description || 'No description available'}
                      </p>

                      {/* Attendance Progress */}
                      <div className="attendance-section">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-white fw-semibold">Registrations</span>
                          <span className="attendance-count" style={{ color: color }}>
                            {attendees} / {event.capacity}
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                              boxShadow: `0 0 10px ${color}88`
                            }}
                          />
                        </div>
                        <div className="text-center mt-2">
                          <span className="percentage-text" style={{ color: color }}>
                            {percentage}% Full
                          </span>
                        </div>
                      </div>

                      {/* Event Info */}
                      <div className="event-info-section">
                        <div className="event-info-item">
                          <Calendar size={20} style={{ color: color }} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="event-info-item">
                          <Clock size={20} style={{ color: color }} />
                          <span>{event.time || 'TBA'}</span>
                        </div>
                        <div className="event-info-item">
                          <MapPin size={20} style={{ color: color }} />
                          <span>{event.location || 'TBA'}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {event.tags?.length > 0 && (
                        <div className="event-tags">
                          {event.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="event-tag"
                              style={{ 
                                background: `${color}22`,
                                borderColor: `${color}55`,
                                color: color
                              }}
                            >
                              <Tag size={12} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="event-card-footer">
                      <button
                        onClick={() => navigate(`/events/registrations/${event._id}`)}
                        className="action-btn view-btn"
                      >
                        View Details ({attendees})
                      </button>
                      <select
                        className="status-select"
                        value={event.registrationStatus || 'Open'}
                        onChange={e => handleStatusChange(event._id, e.target.value)}
                      >
                        {['Upcoming', 'Open', 'Closed', 'Full', 'Completed', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => openDeleteModal(event)}
                        className="action-btn delete-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADD EVENT MODAL */}
        {showAddModal && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.95)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content glass-card border-0 rounded-4">
                <div className="modal-header border-0">
                  <h3 className="text-white fw-bold d-flex align-items-center gap-3">
                    <Plus size={32} className="text-cyan" /> Create New Event
                  </h3>
                  <button className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Title *</label>
                      <input type="text" className="form-control glass-input" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event Title" />
                    </div>
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Category *</label>
                      <select className="form-select glass-input" value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}>
                        {Object.keys(categoryColors).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Date *</label>
                      <input type="date" className="form-control glass-input" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Time</label>
                      <input type="time" className="form-control glass-input" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Location</label>
                      <input type="text" className="form-control glass-input" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="e.g. Auditorium" />
                    </div>
                    <div className="col-md-6">
                      <label className="text-white fw-bold">Capacity</label>
                      <input type="number" className="form-control glass-input" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: Number(e.target.value) || 50 })} min="1" />
                    </div>
                    <div className="col-12">
                      <label className="text-white fw-bold">Description</label>
                      <textarea className="form-control glass-input" rows={4} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="What's this event about?" />
                    </div>
                    <div className="col-12">
                      <label className="text-white fw-bold">Tags (comma separated)</label>
                      <input type="text" className="form-control glass-input" value={newEvent.tags} onChange={e => setNewEvent({ ...newEvent, tags: e.target.value })} placeholder="tech, ai, fun" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 justify-content-end gap-3 pb-5">
                  <button className="btn btn-secondary px-5 rounded-pill" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="btn text-black fw-bold px-6 rounded-pill neon-glow-btn" style={{ background: 'linear-gradient(90deg, #00d4ff, #ff6bcb)' }} onClick={handleAddEvent}>Create Event</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && eventToDelete && (
          <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.95)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-card border border-danger rounded-4">
                <div className="modal-header border-0 text-danger">
                  <h4 className="fw-bold d-flex align-items-center gap-3">
                    <AlertCircle size={28} /> Confirm Deletion
                  </h4>
                  <button className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
                </div>
                <div className="modal-body text-center py-5 text-white">
                  <h4>{eventToDelete.title}</h4>
                  <p className="opacity-80">Type the title to confirm deletion</p>
                  <input type="text" className="form-control glass-input text-center mt-3" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder={eventToDelete.title} autoFocus />
                </div>
                <div className="modal-footer border-0 justify-content-center gap-4 pb-5">
                  <button className="btn btn-outline-light px-6" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger px-7 fw-bold" disabled={deleteConfirmText !== eventToDelete.title} onClick={handleDeleteEvent}>
                    {deleteConfirmText === eventToDelete.title ? 'Delete Forever' : 'Type Title'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        /* Category Filter Buttons - High Contrast */
        .category-filter-btn {
          padding: 12px 28px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 15px;
          border: 2px solid rgba(0, 212, 255, 0.4);
          background: rgba(15, 12, 41, 0.85);
          color: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .category-filter-btn:hover {
          border-color: rgba(0, 212, 255, 0.8);
          background: rgba(0, 212, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
        }

        .category-filter-btn.active {
          background: linear-gradient(135deg, #00d4ff 0%, #ff6bcb 100%);
          border-color: transparent;
          color: #000;
          font-weight: 700;
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5);
          transform: translateY(-2px);
        }

        /* Add Event Button */
        .add-event-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          background: linear-gradient(90deg, #00d4ff, #ff6bcb);
          color: #000;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
        }

        .add-event-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 45px rgba(0, 212, 255, 0.8);
        }

        /* Event Cards - Cleaner Design */
        .event-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .event-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 212, 255, 0.25);
          border-color: rgba(0, 212, 255, 0.4);
        }

        .event-card-header {
          padding: 24px;
        }

        .event-title {
          font-size: 22px;
          font-weight: 700;
          line-height: 1.3;
          max-width: 70%;
        }

        .category-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-card-body {
          padding: 24px;
        }

        .event-description {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 20px;
          min-height: 75px;
        }

        /* Attendance Section */
        .attendance-section {
          background: rgba(0, 0, 0, 0.25);
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .attendance-count {
          font-size: 18px;
          font-weight: 700;
        }

        .progress-bar-container {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.6s ease;
        }

        .percentage-text {
          font-size: 14px;
          font-weight: 600;
        }

        /* Event Info */
        .event-info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .event-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 14px;
        }

        /* Tags */
        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .event-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }

        /* Card Footer */
        .event-card-footer {
          padding: 20px 24px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 10px;
        }

        .action-btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn {
          flex: 1;
        }

        .view-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
        }

        .status-select {
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          cursor: pointer;
        }

        .status-select option {
          background: #1a1a2e;
          color: #fff;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
        }

        /* Modal Styles */
        .glass-card { 
          background: rgba(255,255,255,0.08); 
          backdrop-filter: blur(16px); 
          -webkit-backdrop-filter: blur(16px); 
          border: 1px solid rgba(255,255,255,0.15); 
        }
        
        .glass-input, .form-control, .form-select { 
          background: rgba(255,255,255,0.1) !important; 
          border: 1px solid rgba(255,255,255,0.3) !important; 
          color: white !important; 
        }
        
        .glass-input:focus, .form-control:focus, .form-select:focus { 
          box-shadow: 0 0 25px rgba(0,212,255,0.6); 
          border-color: #00d4ff !important; 
        }
        
        .text-gradient { 
          background: linear-gradient(90deg, #00d4ff, #ff6bcb); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
        }
        
        .text-cyan { 
          color: #00d4ff; 
        }
        
        .neon-glow-btn:hover { 
          box-shadow: 0 0 50px rgba(0,212,255,0.9); 
          transform: scale(1.05); 
        }
      `}</style>
    </>
  );
};

export default EventsPage;
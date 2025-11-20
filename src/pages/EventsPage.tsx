import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { 
  Calendar3, 
  Clock, 
  GeoAltFill, 
  Tag, 
  PlusCircle, 
  Trash3, 
  ListCheck 
} from 'react-bootstrap-icons';

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
  Workshop: "#6366F1",
  Event: "#3B82F6",
  Webinar: "#EC4899",
  Conference: "#8B5CF6",
  Meetup: "#14B8A6",
  Seminar: "#F59E0B",
  Training: "#10B981",
  Other: "#6B7280",
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState(""); // ← NEW: Anti-accident protection

  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    description: '',
    category: 'Event',
    date: '',
    time: '09:00',
    location: '',
    capacity: 50,
    tags: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/events/getEvents', { withCredentials: true });
      setEvents(res.data);
      setTimeout(() => setIsLoading(false), 400);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleAddEvent = async () => {
    const payload = {
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || "",
      category: newEvent.category,
      date: newEvent.date,
      time: newEvent.time || "09:00",
      location: newEvent.location.trim() || "TBA",
      capacity: Number(newEvent.capacity) || 50,
      tags: newEvent.tags ? newEvent.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    if (!payload.title || !payload.date || !payload.category) {
      alert("Title, Date, and Category are required!");
      return;
    }

    try {
      await axios.post('/events/addEvent', payload, { withCredentials: true });
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', category: 'Event', date: '', time: '09:00', location: '', capacity: 50, tags: '' });
      fetchEvents();
      alert("Event created successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create event");
    }
  };

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await axios.put(`/events/${eventId}/status`, { status });
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, registrationStatus: status } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(`/events/${eventToDelete._id}/delete`);
      setEvents(prev => prev.filter(e => e._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
      setDeleteConfirmText(""); // Reset
      alert("Event deleted successfully");
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  const openDeleteModal = (event: EventType) => {
    setEventToDelete(event);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const categories = ["All", ...Array.from(new Set(events.map(e => e.category)))];
  const filteredEvents = selectedCategory === "All" ? events : events.filter(e => e.category === selectedCategory);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-grow text-primary" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient py-5" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh" }}>
        <div className="container">
          <div className="text-center text-white mb-5 pt-4">
            <h1 className="display-4 fw-bold">Events Management</h1>
            <p className="lead opacity-90">Create, manage, and track all your events</p>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div className="btn-group shadow-lg bg-white rounded-pill overflow-hidden">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'} fw-semibold px-4`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button className="btn btn-light btn-lg shadow-lg fw-bold text-primary" onClick={() => setShowAddModal(true)}>
              <PlusCircle className="me-2" /> Add New Event
            </button>
          </div>

          <div className="row g-4">
            {filteredEvents.map((event, idx) => {
              const attendees = event.registeredUsers?.length || 0;
              const percentage = event.capacity > 0 ? (attendees / event.capacity) * 100 : 0;
              const color = categoryColors[event.category] || "#6B7280";

              return (
                <div key={event._id} className="col-md-6 col-lg-4"
                  style={{ animation: `fadeUp 0.6s ease-out forwards`, animationDelay: `${idx * 0.1}s`, opacity: 0 }}>
                  <div className="card h-100 border-0 shadow-lg rounded-3 overflow-hidden hover-lift">
                    <div className="card-header text-white fw-bold py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: color }}>
                      <span className="text-truncate me-2">{event.title}</span>
                      <span className="badge bg-white text-dark">{event.category}</span>
                    </div>

                    <div className="card-body bg-white">
                      <p className="text-muted mb-4">{event.description || "No description"}</p>

                      <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                          <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                            <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="10" fill="none"
                              strokeDasharray={`${percentage * 2.83} 283`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                          </svg>
                          <div className="position-absolute top-50 start-50 translate-middle text-center">
                            <div className="fw-bold fs-4">{attendees}</div>
                            <small className="text-muted">of {event.capacity}</small>
                          </div>
                        </div>
                        <div className="mt-2 fw-bold text-dark">
                          {percentage >= 100 ? "FULL" : `${Math.round(percentage)}% Filled`}
                        </div>
                      </div>

                      <div className="row g-3 text-muted small">
                        <div className="col-12 d-flex align-items-center"><Calendar3 className="me-2 text-primary" size={18} /> {formatDate(event.date)}</div>
                        <div className="col-12 d-flex align-items-center"><Clock className="me-2 text-primary" size={18} /> {event.time}</div>
                        <div className="col-12 d-flex align-items-center"><GeoAltFill className="me-2 text-primary" size={18} /> {event.location}</div>
                      </div>

                      <div className="mt-3">
                        {event.tags?.map((tag, i) => (
                          <span key={i} className="badge me-1 mb-1" style={{ backgroundColor: `${color}30`, color }}>
                            <Tag size={12} className="me-1" />{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="card-footer bg-light border-0 d-flex gap-2">
                      <button className="btn btn-outline-primary flex-fill" onClick={() => navigate(`/events/registrations/${event._id}`)}>
                        <ListCheck className="me-1" /> View ({attendees})
                      </button>
                      <select className="form-select form-select-sm" value={event.registrationStatus || "Open"}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)} style={{ maxWidth: '140px' }}>
                        {['Upcoming', 'Open', 'Closed', 'Full', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-outline-danger" onClick={() => openDeleteModal(event)}>
                        <Trash3 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header bg-primary text-white border-0">
                <h4 className="modal-title fw-bold"><PlusCircle className="me-2" /> Create New Event</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                    <input type="text" className="form-control form-control-lg" placeholder="Event title"
                      value={newEvent.title || ''} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Location</label>
                    <input type="text" className="form-control form-control-lg" placeholder="Main Seminar Hall"
                      value={newEvent.location || ''} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date <span className="text-danger">*</span></label>
                    <input type="date" className="form-control form-control-lg"
                      value={newEvent.date || ''} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Time</label>
                    <input type="time" className="form-control form-control-lg"
                      value={newEvent.time || '09:00'} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Capacity</label>
                    <input type="number" className="form-control form-control-lg" placeholder="50"
                      value={newEvent.capacity || ''} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category <span className="text-danger">*</span></label>
                    <select className="form-select form-select-lg"
                      value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}>
                      {Object.keys(categoryColors).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea className="form-control" rows={3} placeholder="What is this event about?"
                      value={newEvent.description || ''} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Tags (comma separated)</label>
                    <input type="text" className="form-control" placeholder="volunteering, tech, workshop"
                      value={newEvent.tags || ''} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4">
                <button className="btn btn-secondary btn-lg px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-lg px-5" onClick={handleAddEvent}>Create Event</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURE DELETE MODAL – Cannot delete by mistake */}
      {showDeleteModal && eventToDelete && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">Delete Event Permanently?</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-5">
                <h4 className="text-danger mb-3">{eventToDelete.title}</h4>
                <p className="text-muted mb-4">
                  This action <strong>cannot be undone</strong>. All registrations will be lost forever.
                </p>

                <div className="alert alert-warning py-3 mb-4">
                  <strong>Type the event title to confirm deletion:</strong>
                </div>

                <input
                  type="text"
                  className="form-control form-control-lg text-center mb-3"
                  placeholder={`Type "${eventToDelete.title}" exactly`}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  autoFocus
                  style={{ fontWeight: 'bold', letterSpacing: '1px' }}
                />

                <small className="text-muted">
                  {deleteConfirmText === eventToDelete.title
                    ? "Delete button enabled"
                    : `Type the full title to enable deletion`}
                </small>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-5">
                <button className="btn btn-secondary btn-lg px-5" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-lg px-5"
                  disabled={deleteConfirmText !== eventToDelete.title}
                  onClick={handleDeleteEvent}
                >
                  {deleteConfirmText === eventToDelete.title ? "Delete Forever" : "Type Title to Enable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; }
      `}</style>
    </>
  );
};

export default EventsPage;
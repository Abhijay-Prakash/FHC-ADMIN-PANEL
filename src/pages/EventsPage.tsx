import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  tags: string[];
  category: string;
  registrationStatus?: string;
}

const categoryColors: { [key: string]: string } = {
  Workshop: "#6366F1",
  Event: "#3B82F6",
  Webinar: "#EC4899",
  Conference: "#8B5CF6",
  Meetup: "#14B8A6",
  Seminar: "#F59E0B",
  Training: "#10B981",
  Other: "#6B7280",
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || categoryColors.Other;
};

const getTextColor = (bgColor: string) => {
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#000000" : "#FFFFFF";
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [newEvent, setNewEvent] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/events/getEvents', { withCredentials: true });
      setEvents(res.data);
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleAddEvent = async () => {
    const formattedEvent = {
      ...newEvent,
      date: new Date(newEvent.date).toISOString(),
      category: newEvent.category || "Workshop",
      tags: newEvent.tags ? newEvent.tags.split(',').map((tag: string) => tag.trim()) : [],
    };

    try {
      await axios.post('/events/addEvent', formattedEvent);
      setShowAddModal(false);
      setNewEvent({});
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    navigate(`/events/registrations/${eventId}`);
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      await axios.put(`/events/${eventId}/status`, { status: newStatus });
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, registrationStatus: newStatus } : event
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await axios.delete(`/events/${eventToDelete._id}/delete`);
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventToDelete._id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete the event. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const categories = ["All", ...Array.from(new Set(events.map(event => event.category)))];

  const filterEvents = () => {
    if (selectedCategory === "All") return events;
    return events.filter(event => event.category === selectedCategory);
  };

  return (
    <div className="container-fluid py-5" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)", minHeight: "100vh" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ color: "#4F46E5", textShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}>
            <i className="bi bi-calendar-event me-2"></i>
            Events Admin Panel
          </h1>
          <p className="lead text-muted">Manage your events with style</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="btn-group mb-3 mb-md-0" role="group">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg shadow-sm"
            onClick={() => setShowAddModal(true)}
            style={{
              background: "linear-gradient(45deg, #4F46E5, #7C3AED)",
              border: "none",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <i className="bi bi-plus-circle me-2"></i> Add New Event
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filterEvents().map((event) => {
              const categoryColor = getCategoryColor(event.category);
              const textColor = getTextColor(categoryColor);

              return (
                <div key={event._id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow">
                    <div className="card-header py-3" style={{ backgroundColor: categoryColor, color: textColor }}>
                      <h5 className="m-0 fw-bold">{event.title}</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <span className="badge" style={{ backgroundColor: categoryColor, color: textColor }}>
                          {event.category}
                        </span>
                        <span className="ms-2 text-muted">
                          <i className="bi bi-people-fill me-1"></i>
                          Capacity: {event.capacity}
                        </span>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Registration Status:</label>
                        <select
                          className="form-select"
                          value={event.registrationStatus || 'Open'}
                          onChange={(e) => handleStatusChange(event._id, e.target.value)}
                        >
                          {['Upcoming', 'Open', 'Closed', 'Full', 'Completed', 'Cancelled'].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <p className="card-text mb-3">{event.description}</p>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-calendar3 text-primary me-2"></i>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <i className="bi bi-clock text-primary ms-3 me-2"></i>
                        <span>{event.time}</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className="mb-3">
                        {event.tags.map((tag, idx) => (
                          <span key={idx} className="badge me-1 mb-1" style={{ backgroundColor: `${categoryColor}40`, color: categoryColor }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="card-footer bg-white border-0 pb-3 d-flex gap-2">
                      <button className="btn flex-fill" style={{ backgroundColor: categoryColor, color: textColor }} onClick={() => handleViewRegistrations(event._id)}>
                        <i className="bi bi-list-check me-2"></i> View Registrations
                      </button>
                      <button
                        className="btn btn-outline-danger flex-fill"
                        onClick={() => {
                          setEventToDelete(event);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filterEvents().length === 0 && (
          <div className="text-center py-5">
            <div style={{ color: "#6B7280", fontSize: "4rem" }}>
              <i className="bi bi-calendar-x"></i>
            </div>
            <h3 className="mt-3">No events found</h3>
            <p className="text-muted">No events match your current filter or none have been added yet.</p>
            <button className="btn btn-outline-primary mt-3" onClick={() => setSelectedCategory("All")}>
              Reset filters
            </button>
          </div>
        )}
      </div>
          
      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "15px" }}>
              <div className="modal-header">
                <h5 className="modal-title">Add New Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <input type="text" className="form-control" placeholder="Title" value={newEvent.title || ''} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <input type="text" className="form-control" placeholder="Location" value={newEvent.location || ''} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <input type="date" className="form-control" value={newEvent.date || ''} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <input type="time" className="form-control" value={newEvent.time || ''} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <input type="number" className="form-control" placeholder="Capacity" value={newEvent.capacity || ''} onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })} />
                  </div>
                  <div className="col-md-6">
                    <select className="form-select" value={newEvent.category || 'Workshop'} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}>
                      <option>Workshop</option>
                      <option>Webinar</option>
                      <option>Conference</option>
                      <option>Meetup</option>
                      <option>Seminar</option>
                      <option>Training</option>
                      <option>Meeting</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <textarea className="form-control" placeholder="Description" rows={3} value={newEvent.description || ''} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                  </div>
                  <div className="col-12">
                    <input type="text" className="form-control" placeholder="Tags (comma separated)" value={newEvent.tags || ''} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddEvent}>Add Event</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete <strong>{eventToDelete?.title}</strong>? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteEvent}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

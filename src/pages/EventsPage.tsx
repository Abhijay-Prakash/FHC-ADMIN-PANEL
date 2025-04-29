import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
}

// Event category color mapping
const categoryColors = {
  Workshop: "#6366F1", // Indigo
  Webinar: "#EC4899", // Pink
  Conference: "#8B5CF6", // Purple
  Meetup: "#14B8A6", // Teal
  Seminar: "#F59E0B", // Amber
  Training: "#10B981", // Emerald
  Other: "#6B7280", // Gray
};

// Get color based on category
const getCategoryColor = (category) => {
  return categoryColors[category] || categoryColors.Other;
};

// Get contrasting text color for a background
const getTextColor = (bgColor) => {
  // Simple check for light/dark background
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/events/getEvents', { withCredentials: true });
      setEvents(res.data);
      setTimeout(() => setIsLoading(false), 500); // Simulate loading for transition effect
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
      tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()) : [],
    };

    try {
      await axios.post('http://localhost:5000/api/events/addEvent', formattedEvent);
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

  const filterEvents = () => {
    if (selectedCategory === "All") return events;
    return events.filter(event => event.category === selectedCategory);
  };

  const categories = ["All", ...Array.from(new Set(events.map(event => event.category)))];

  return (
    <div className="container-fluid py-5" style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
      minHeight: "100vh" 
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ 
            color: "#4F46E5",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)" 
          }}>
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
                <div key={event._id} className="col-md-6 col-lg-4" style={{
                  opacity: 1,
                  animation: "fadeIn 0.5s ease-in-out"
                }}>
                  <div 
                    className="card h-100 border-0 shadow" 
                    style={{ 
                      transition: "transform 0.3s, box-shadow 0.3s",
                      overflow: "hidden"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <div 
                      className="card-header py-3" 
                      style={{ 
                        backgroundColor: categoryColor,
                        color: textColor,
                        borderBottom: 0
                      }}
                    >
                      <h5 className="m-0 fw-bold">{event.title}</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: categoryColor,
                            color: textColor
                          }}
                        >
                          {event.category}
                        </span>
                        <span className="ms-2 text-muted">
                          <i className="bi bi-people-fill me-1"></i>
                          Capacity: {event.capacity}
                        </span>
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
                          <span 
                            key={idx} 
                            className="badge me-1 mb-1" 
                            style={{ 
                              backgroundColor: `${categoryColor}40`, // 40 is opacity in hex
                              color: categoryColor,
                              fontWeight: "500"
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="card-footer bg-white border-0 pb-3">
                      <button
                        className="btn btn-primary w-100" 
                        onClick={() => handleViewRegistrations(event._id)}
                        style={{
                          backgroundColor: categoryColor,
                          borderColor: categoryColor,
                          color: textColor
                        }}
                      >
                        <i className="bi bi-list-check me-2"></i>
                        View Registrations
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filterEvents().length === 0 && (
          <div className="text-center py-5">
            <div style={{ color: "#6B7280", fontSize: "4rem" }}>
              <i className="bi bi-calendar-x"></i>
            </div>
            <h3 className="mt-3">No events found</h3>
            <p className="text-muted">No events match your current filter or none have been added yet.</p>
            <button 
              className="btn btn-outline-primary mt-3"
              onClick={() => setSelectedCategory("All")}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ 
                borderRadius: "15px",
                animation: "modalFadeIn 0.3s ease-out"
              }}
            >
              <div className="modal-header" style={{ 
                background: "linear-gradient(45deg, #4F46E5, #7C3AED)",
                borderRadius: "15px 15px 0 0",
                color: "white",
                border: "none"
              }}>
                <h5 className="modal-title"><i className="bi bi-plus-circle me-2"></i>Add New Event</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Event Title</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter a catchy title"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="What's this event about?"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Category</label>
                    <select
                      className="form-select"
                      value={newEvent.category || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      {Object.keys(categoryColors).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="How many people can attend?"
                      value={newEvent.capacity || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newEvent.date || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={newEvent.time || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-bold">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Where will it be held?"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-bold">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Comma separated tags (e.g. tech, networking, beginner)"
                      value={newEvent.tags || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary px-4" 
                  onClick={handleAddEvent}
                  style={{
                    background: "linear-gradient(45deg, #4F46E5, #7C3AED)",
                    border: "none"
                  }}
                >
                  <i className="bi bi-save me-2"></i>Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
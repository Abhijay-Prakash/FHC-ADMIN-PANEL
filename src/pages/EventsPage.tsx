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

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [newEvent, setNewEvent] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/getEvents', { withCredentials: true });
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEvent = async () => {
    const formattedEvent = {
      ...newEvent,
      date: new Date(newEvent.date).toISOString(), // Ensure the date is in ISO format
      category: newEvent.category || "Workshop", // Default category if none provided
      tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()) : [], // Ensure tags are an array
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

  return (
<div className="container mt-5">
  <h1 className="mb-4 text-center">Events Admin Panel</h1>

  <div className="text-center mb-4">
    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
      Add New Event
    </button>
  </div>

  <div className="row">
    {events.map((event) => (
      <div key={event._id} className="col-md-4 mb-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">{event.title}</h5>
            <p className="card-text">{event.description}</p>
            <p className="card-text">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br />
              <strong>Time:</strong> {event.time}<br />
              <strong>Location:</strong> {event.location}
            </p>
            <div className="mb-2">
              {event.tags.map((tag, idx) => (
                <span key={idx} className="badge bg-secondary me-1">{tag}</span>
              ))}
            </div>
            <div className="mt-auto">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => handleViewRegistrations(event._id)}
              >
                View Registrations
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>


      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Title"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Description"
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Category"
                  value={newEvent.category || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                />
                <input
                  type="date"
                  className="form-control mb-2"
                  value={newEvent.date || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <input
                  type="time"
                  className="form-control mb-2"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Location"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Capacity"
                  value={newEvent.capacity || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Tags (comma separated)"
                  value={newEvent.tags || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddEvent}>
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

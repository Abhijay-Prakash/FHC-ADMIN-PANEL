// src/pages/CertificateSenderPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { 
  Envelope, Send, Eye, CheckCircle, XCircle, ExclamationTriangle, 
   Calendar3 
} from 'react-bootstrap-icons';

type Event = {
  _id: string;
  title: string;
  date: string;
  category: string;
  registeredUsers: string[];
  description?: string;
};

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

const CertificateSenderPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [eventToSend, setEventToSend] = useState<Event | null>(null);

  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/getEvents');
      const filtered = response.data.filter((e: Event) => e.registeredUsers?.length > 0);
      setEvents(filtered);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setMessage({ text: 'Failed to load events', type: 'error' });
    }
  };

  const openConfirmModal = (event: Event) => {
    setEventToSend(event);
    setShowConfirmModal(true);
  };

  const confirmAndSend = async () => {
    if (!eventToSend) return;
    setShowConfirmModal(false);
    await sendCertificates(eventToSend._id);
  };

  const sendCertificates = async (eventId: string) => {
    setLoading(eventId);
    setMessage(null);
    try {
      const res = await axios.post(`/certificate/send-all/${eventId}`);
      setMessage({ text: res.data.message || 'Certificates sent successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to send certificates. Try sending individually.', 
        type: 'error' 
      });
    } finally {
      setLoading(null);
      setEventToSend(null);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-gradient py-5" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh" }}>
        <div className="container">
          <div className="text-center text-white mb-5 pt-4">
            <h1 className="display-4 fw-bold">
              <Envelope className="me-3" size={48} />
              Certificate Sender
            </h1>
            <p className="lead opacity-90">Send participation certificates with confidence</p>
          </div>

          {/* Toast Message */}
          {message && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4`} style={{ zIndex: 9999, maxWidth: '500px' }}>
              <div className="d-flex align-items-center">
                {message.type === 'success' ? <CheckCircle className="me-2" /> : <XCircle className="me-2" />}
                <strong>{message.text}</strong>
              </div>
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}

          {events.length === 0 ? (
            <div className="text-center py-5 text-white">
              <Envelope size={80} className="opacity-50 mb-4" />
              <h3>No events with participants</h3>
              <p>Certificates can only be sent to events with registered attendees.</p>
            </div>
          ) : (
            <div className="row g-4">
              {events.map((event, idx) => {
                const attendees = event.registeredUsers?.length || 0;
                const color = categoryColors[event.category] || "#6B7280";

                return (
                  <div
                    key={event._id}
                    className="col-md-6 col-lg-4"
                    style={{ animation: `fadeUp 0.6s ease-out forwards`, animationDelay: `${idx * 0.1}s`, opacity: 0 }}
                  >
                    <div className="card h-100 border-0 shadow-lg rounded-3 overflow-hidden hover-lift">
                      <div className="card-header text-white fw-bold py-3" style={{ backgroundColor: color }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-truncate me-2">{event.title}</span>
                          <span className="badge bg-white text-dark">{event.category}</span>
                        </div>
                      </div>

                      <div className="card-body bg-white">
                        {event.description && (
                          <p className="text-muted small mb-3">{event.description}</p>
                        )}

                        <div className="text-center mb-4">
                          <div className="position-relative d-inline-block">
                            <svg width="90" height="90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="8" fill="none" />
                              <circle
                                cx="50" cy="50" r="45"
                                stroke={color}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${attendees * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                              <div className="fw-bold fs-5">{attendees}</div>
                              <small className="text-muted">participants</small>
                            </div>
                          </div>
                        </div>

                        <div className="text-muted small">
                          <div className="d-flex align-items-center mb-2">
                            <Calendar3 className="me-2 text-primary" size={16} />
                            {formatDate(event.date)}
                          </div>
                        </div>
                      </div>

                      <div className="card-footer bg-light border-0 d-flex gap-2">
                        <button
                          className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                          onClick={() => openConfirmModal(event)}
                          disabled={loading === event._id}
                        >
                          {loading === event._id ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Send to All ({attendees})
                            </>
                          )}
                        </button>

                        <button
                          className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
                          onClick={() => navigate(`/certificates/individual/${event._id}`)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL – Prevents accidental mass sending */}
      {showConfirmModal && eventToSend && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header bg-warning text-dark border-0">
                <h5 className="modal-title fw-bold">
                  <ExclamationTriangle className="me-2" />
                  Confirm Mass Certificate Send
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body text-center py-5">
                <h4 className="mb-3">{eventToSend.title}</h4>
                <p className="text-muted mb-4">
                  You are about to send certificates to <strong>{eventToSend.registeredUsers.length} participants</strong>.
                </p>
                <div className="alert alert-danger py-3">
                  <strong>Warning:</strong> Sending to many users at once may cause:
                  <ul className="mt-2 mb-0 text-start">
                    <li>High server load</li>
                    <li>Email delivery delays</li>
                    <li>Some emails may fail</li>
                  </ul>
                </div>
                <p className="text-success fw-bold">
                  Recommendation: Use "View Participants" to send individually for better reliability.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3 pb-5">
                <button className="btn btn-secondary btn-lg px-4" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-warning btn-lg px-5" 
                  onClick={confirmAndSend}
                >
                  Send to All Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </>
  );
};

export default CertificateSenderPage;
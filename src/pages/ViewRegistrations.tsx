import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { 
  Telephone, 
  Envelope, 
  Calendar3, 
  PersonCircle   // ← works perfectly as avatar fallback
} from 'react-bootstrap-icons';

interface RegisteredUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  semester: number;
  class: string;
  profilePic?: string;
  registeredAt?: string;
}

const ViewRegistrationsPage = () => {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { eventId } = useParams<{ eventId: string }>();

  useEffect(() => {
    if (eventId) {
      fetchRegistrations(eventId);
    }
  }, [eventId]);

  const fetchRegistrations = async (eventId: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/events/registrations', { eventId });
      setRegisteredUsers(res.data.registeredUsers || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light py-5" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary">Event Registrations</h1>
          <p className="text-muted lead">All participants registered for this event</p>
        </div>

        {registeredUsers.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow" style={{ width: 100, height: 100 }}>
                <PersonCircle size={48} className="text-muted" />
              </div>
            </div>
            <h4 className="text-muted">No registrations yet</h4>
            <p className="text-muted">Participants will appear here once they register.</p>
          </div>
        ) : (
          <div className="row gy-4">
            {registeredUsers.map((user, index) => (
              <div
                key={user._id || index}
                className="col-md-6 col-lg-4"
                style={{
                  animation: `fadeUp 0.5s ease forwards ${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div className="card h-100 shadow hover-shadow border-0 rounded-3">
                  <div className="card-body p-4">
                    {/* Avatar + Name + Semester Badge */}
                    <div className="d-flex align-items-center mb-3">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name}
                          className="rounded-circle me-3"
                          style={{ width: 56, height: 56, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 fw-bold"
                          style={{ width: 56, height: 56, fontSize: '1.8rem' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="mb-1 fw-bold">{user.name}</h5>
                        <span className="badge bg-success-subtle text-success fw-bold">
                          S{user.semester} {user.class}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <Envelope className="me-2" size={16} />
                        <a href={`mailto:${user.email}`} className="text-decoration-none text-dark">
                          {user.email}
                        </a>
                      </div>

                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <Telephone className="me-2" size={16} />
                        <a href={`tel:${user.phone}`} className="text-decoration-none text-dark">
                          {user.phone}
                        </a>
                      </div>

                      {user.registeredAt && (
                        <div className="d-flex align-items-center text-muted small">
                          <Calendar3 className="me-2" size={16} />
                          Registered on{' '}
                          {new Date(user.registeredAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple CSS keyframes – no <style jsx> needed */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ViewRegistrationsPage;
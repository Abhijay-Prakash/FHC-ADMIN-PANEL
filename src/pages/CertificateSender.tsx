// CertificateSenderPage.tsx
import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';

type Event = {
  _id: string;
  title: string;
  date: string;
  category: string;
};

const CertificateSenderPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/getEvents');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const sendCertificates = async (eventId: string) => {
    setLoading(eventId);
    setMessage(null);
    try {
      const res = await axios.post(`/certificate/send-all/${eventId}`);
      setMessage(res.data.message || 'Certificates sent!');
    } catch (error) {
      console.error('Failed to send certificates:', error);
      setMessage('Failed to send certificates.');
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Send Certificates to All Attendees</h2>
      {message && <div style={{ marginBottom: '1rem', color: 'green' }}>{message}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map((event) => (
          <li key={event._id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{event.title}</strong>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  {new Date(event.date).toLocaleDateString()} | {event.category}
                </div>
              </div>
              <button
                onClick={() => sendCertificates(event._id)}
                disabled={loading === event._id}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading === event._id ? 'not-allowed' : 'pointer',
                }}
              >
                {loading === event._id ? 'Sending...' : 'Send Certificates'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificateSenderPage;

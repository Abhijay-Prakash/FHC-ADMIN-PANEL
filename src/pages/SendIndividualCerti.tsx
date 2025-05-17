// src/pages/SendIndividualCerti.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

type UserType = {
  name: string;
  email: string;
  class: string;
  semester: string;
};

const SendIndividualCerti: React.FC = () => {
  const { eventId } = useParams();
  const [registeredUsers, setRegisteredUsers] = useState<UserType[]>([]);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchRegistrations(eventId);
    }
  }, [eventId]);

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await axios.post('/events/registrations', { eventId });
      setRegisteredUsers(res.data.registeredUsers);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const sendCertificate = async (user: UserType) => {
    setLoadingEmail(user.email);
    setSuccessMessage(null);
    try {
      await axios.post('/certificate/send-certificate', {
        name: user.name,
        email: user.email,
        eventId, // Optional: replace with event title if needed
      });
      setSuccessMessage(`Certificate sent to ${user.email}`);
    } catch (error) {
      console.error(`Error sending certificate to ${user.email}:`, error);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Registered Participants</h2>
      {successMessage && <div style={{ marginBottom: '1rem', color: 'green' }}>{successMessage}</div>}
      {registeredUsers.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {registeredUsers.map((user, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                width: '250px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h4>{user.name}</h4>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Class:</strong> {user.class}</p>
              <p><strong>Semester:</strong> {user.semester}</p>
              <button
                onClick={() => sendCertificate(user)}
                disabled={loadingEmail === user.email}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  width: '100%',
                  cursor: loadingEmail === user.email ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingEmail === user.email ? 'Sending...' : 'Send Certificate'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No registrations found.</p>
      )}
    </div>
  );
};

export default SendIndividualCerti;

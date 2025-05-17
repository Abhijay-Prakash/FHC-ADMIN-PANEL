import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

type UserType = {
  name: string;
  email: string;
  class: string;
  semester: number;
};

const SendIndividualCerti: React.FC = () => {
  const { eventId } = useParams();
  const [registeredUsers, setRegisteredUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (eventId) fetchRegistrations(eventId);
  }, [eventId]);

  useEffect(() => {
    applyFilters();
  }, [registeredUsers, search, selectedSemester, selectedClass]);

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await axios.post('/events/registrations', { eventId });
      setRegisteredUsers(res.data.registeredUsers);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const applyFilters = () => {
    let filtered = registeredUsers;

    if (search.trim()) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedSemester) {
      filtered = filtered.filter(
        (user) => user.semester === parseInt(selectedSemester)
      );
    }

    if (selectedClass) {
      filtered = filtered.filter((user) => user.class === selectedClass);
    }

    setFilteredUsers(filtered);
  };

  const sendCertificate = async (user: UserType) => {
    setLoadingEmail(user.email);
    setSuccessMessage(null);
    try {
      await axios.post('/certificate/send-certificate', {
        name: user.name,
        email: user.email,
        eventId,
      });
      setSuccessMessage(`Certificate sent to ${user.email}`);
    } catch (error) {
      console.error(`Error sending certificate to ${user.email}:`, error);
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Registered Participants
      </h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flex: 1 }}
        />

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="">All Semesters</option>
          {[...Array(8)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="">All Classes</option>
          {['CSA', 'CSB', 'CSC', 'CSD', 'EC', 'EI', 'EE', 'ME', 'CE'].map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {successMessage && (
        <div style={{ marginBottom: '1rem', color: 'green' }}>{successMessage}</div>
      )}

      {filteredUsers.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {filteredUsers.map((user, index) => (
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

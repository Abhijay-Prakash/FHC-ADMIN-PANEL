import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

interface UserType {
  name: string;
  email: string;
  class: string;
  semester: string;
}

const ViewRegistrationsPage = () => {
  const [registeredUsers, setRegisteredUsers] = useState<UserType[]>([]);
  const { eventId } = useParams(); // Extract eventId from URL

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

  return (
    <div className="container mt-5 ">
      <h1 className="mb-4">Registered Users for Event</h1>

      {registeredUsers.length > 0 ? (
        <ul className="list-group">
          {registeredUsers.map((user, index) => (
            <li key={index} className="list-group-item">
              <h5>{user.name}</h5>
              <p>{user.email}</p>
              <p>Class: {user.class}</p>
              <p>Semester: {user.semester}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No registrations found.</p>
      )}
    </div>
  );
};

export default ViewRegistrationsPage;

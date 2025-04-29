import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


// Define the participant type (since backend returns these fields directly)
interface ParticipantType {
  name: string;
  email: string;
  semester: string;
  class: string;
}

const ByteParticipants: React.FC = () => {
  const { courseId } = useParams(); // get dynamic domain from URL
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!courseId) return; // Exit if no courseId in URL

      try {
        const res = await axios.get(`http://localhost:5000/api/byte/participants?domain=${courseId}`);
        if (Array.isArray(res.data)) {
          setParticipants(res.data);
        } else {
          console.error("Unexpected API response:", res.data);
          setParticipants([]);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch participants");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [courseId]);

  if (!courseId) {
    return <div>No course specified in URL.</div>;
  }

  if (loading) {
    return <div>Loading participants...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Participants for {courseId.toUpperCase()}</h2>
      {participants.length === 0 ? (
        <p>No participants found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f4f4f4' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Semester</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Class</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {participant.name}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {participant.email}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {participant.semester}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {participant.class}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ByteParticipants;
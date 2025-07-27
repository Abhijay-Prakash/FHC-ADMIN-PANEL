import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

interface ParticipantType {
  name: string;
  email: string;
  semester: string;
  class: string;
  paymentVerified: boolean;
  userId: string;
}

const ByteParticipants: React.FC = () => {
  const { courseId } = useParams();
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantType[]>([]);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!courseId) return;

      try {
        const res = await axios.get(`/byte/participants?domain=${courseId}`);
        if (Array.isArray(res.data)) {
          const cleanedData = res.data.map((p: any) => ({
            ...p,
            semester: p.semester?.toString().trim(),
            class: p.class?.toString().trim()
          }));
          setParticipants(cleanedData);
          setFilteredParticipants(cleanedData);
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

  const uniqueSemesters = Array.from(new Set(participants.map(p => p.semester?.trim()))).sort();
  const uniqueClasses = Array.from(new Set(participants.map(p => p.class?.trim()))).sort();

  useEffect(() => {
    let filtered = [...participants];

    if (search.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (semesterFilter.trim() !== '') {
      filtered = filtered.filter(p =>
        p.semester?.toLowerCase().trim() === semesterFilter.toLowerCase().trim()
      );
    }

    if (classFilter.trim() !== '') {
      filtered = filtered.filter(p =>
        p.class?.toLowerCase().trim() === classFilter.toLowerCase().trim()
      );
    }

    setFilteredParticipants(filtered);
  }, [search, semesterFilter, classFilter, participants]);

  // ✅ Toggle payment verification status
  const handleTogglePayment = async (userId: string, newStatus: boolean) => {
    try {
      const res = await axios.post('/byte/updatePaymentStatus', { userId, status: newStatus });
      const updatedList = participants.map(p =>
        p.userId === userId ? { ...p, paymentVerified: newStatus } : p
      );
      setParticipants(updatedList);
      setFilteredParticipants(updatedList);
      alert(res.data.message);
    } catch (error) {
      console.error("Payment status update failed:", error);
      alert("Failed to update payment status.");
    }
  };

  const semesterData = uniqueSemesters.map(sem => ({
    name: sem,
    count: participants.filter(p => p.semester?.trim() === sem).length
  }));

  const classData = uniqueClasses.map(cls => ({
    name: cls,
    count: participants.filter(p => p.class?.trim() === cls).length
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'];

  if (!courseId) return <div>No course specified in URL.</div>;
  if (loading) return <div>Loading participants...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Participants for {courseId.toUpperCase()}</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">All Semesters</option>
          {uniqueSemesters.map((sem, i) => (
            <option key={i} value={sem}>{sem}</option>
          ))}
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">All Classes</option>
          {uniqueClasses.map((cls, i) => (
            <option key={i} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredParticipants.length === 0 ? (
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
                <th style={{ padding: '12px', textAlign: 'left' }}>Payment Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{participant.name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{participant.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{participant.semester}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{participant.class}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {participant.paymentVerified ? '✅ Verified' : '❌ Not Verified'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleTogglePayment(participant.userId, !participant.paymentVerified)}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        backgroundColor: participant.paymentVerified ? '#e74c3c' : '#2ecc71',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {participant.paymentVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts */}
      <h3 style={{ marginTop: '40px' }}>Visualization</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '500px', height: '300px' }}>
          <h4>Participants by Semester</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={semesterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '100%', maxWidth: '400px', height: '300px' }}>
          <h4>Participants by Class</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={classData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {classData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ByteParticipants;

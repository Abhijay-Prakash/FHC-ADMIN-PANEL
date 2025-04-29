import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Dropdown } from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  role: string;
}

const ViewMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('/users/members ', { withCredentials: true });
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members", error);
      }
    };
    fetchMembers();
  }, []);

  // Handle role filter
  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const filteredMembers =
    selectedRole === 'all' ? members : members.filter(member => member.role === selectedRole);

  // Update user role
  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await axios.patch(`/users/${memberId}/role`, { newRole }, { withCredentials: true });
      setMembers(prev =>
        prev.map(m => (m._id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Could not update role. Try again later.");
    }
  };

  // Get role-based styling
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-success text-white';
      case 'execom':
        return 'bg-primary text-white';
      case 'member':
        return 'bg-secondary text-white';
      default:
        return '';
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">View Members</h2>
      <div className="d-flex justify-content-center mb-4">
        <button className={`btn btn-outline-dark mx-1 ${selectedRole === 'all' ? 'active' : ''}`} onClick={() => handleRoleFilter('all')}>All</button>
        <button className={`btn btn-outline-success mx-1 ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => handleRoleFilter('admin')}>Admins</button>
        <button className={`btn btn-outline-primary mx-1 ${selectedRole === 'execom' ? 'active' : ''}`} onClick={() => handleRoleFilter('execom')}>Execom</button>
        <button className={`btn btn-outline-secondary mx-1 ${selectedRole === 'member' ? 'active' : ''}`} onClick={() => handleRoleFilter('member')}>Members</button>
      </div>

      <div className="row">
        {filteredMembers.map(member => (
          <div className="col-md-4 mb-4" key={member._id}>
            <div className="card shadow-sm h-100">
              <div className="card-body position-relative">
                <h5 className="card-title">{member.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{member.email}</h6>
                <p className="card-text mb-1"><strong>Phone:</strong> {member.phone}</p>
                <p className="card-text mb-1"><strong>Domain:</strong> {member.domain}</p>
                <p className="card-text mb-1">
                  <strong>Role:</strong> 
                  <span className={`badge ms-2 ${getRoleStyle(member.role)}`}>{member.role}</span>
                </p>

                <Dropdown drop="start" className="position-absolute top-0 end-0 m-2">
                  <Dropdown.Toggle 
                    variant="light" 
                    size="sm" 
                    className="border-0 rounded-circle shadow-sm p-1"
                    style={{ width: '32px', height: '32px' }}>
                    <ThreeDotsVertical size={16} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => updateMemberRole(member._id, 'admin')}>Make Admin</Dropdown.Item>
                    <Dropdown.Item onClick={() => updateMemberRole(member._id, 'execom')}>Make Execom</Dropdown.Item>
                    <Dropdown.Item onClick={() => updateMemberRole(member._id, 'member')}>Make Member</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewMembers;

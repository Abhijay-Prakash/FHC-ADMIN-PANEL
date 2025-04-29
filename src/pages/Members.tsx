import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Dropdown } from 'react-bootstrap';
import { 
  ThreeDotsVertical, 
  PersonCheck, 
  Telephone, 
  Envelope, 
  Grid3x3, 
  PersonBadge
} from 'react-bootstrap-icons';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [animation, setAnimation] = useState<boolean>(false);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/users/members', { withCredentials: true });
        setMembers(response.data);
        setTimeout(() => {
          setAnimation(true);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching members", error);
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Handle role filter
  const handleRoleFilter = (role: string) => {
    setAnimation(false);
    setTimeout(() => {
      setSelectedRole(role);
      setAnimation(true);
    }, 300);
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
        return {
          bg: 'bg-gradient bg-danger',
          text: 'text-white',
          border: 'border-danger'
        };
      case 'execom':
        return {
          bg: 'bg-gradient bg-primary',
          text: 'text-white',
          border: 'border-primary'
        };
      case 'member':
        return {
          bg: 'bg-gradient bg-info',
          text: 'text-dark',
          border: 'border-info'
        };
      default:
        return {
          bg: '',
          text: '',
          border: ''
        };
    }
  };

  // Role badges with improved visual design
  const RoleBadge = ({ role }: { role: string }) => {
    const style = getRoleStyle(role);
    return (
      <span className={`badge ${style.bg} ${style.text} py-2 px-3 rounded-pill fw-bold shadow-sm`}>
        <PersonBadge className="me-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
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
    <div className="bg-light py-4" style={{ minHeight: '100vh' }}>
      <div className="container my-4">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-2">Team Members</h2>
          <p className="text-muted">Manage and view all team members</p>
        </div>
        
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group shadow-sm" role="group">
            <button 
              className={`btn ${selectedRole === 'all' ? 'btn-dark' : 'btn-outline-dark'} px-4`} 
              onClick={() => handleRoleFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${selectedRole === 'admin' ? 'btn-danger' : 'btn-outline-danger'} px-4`} 
              onClick={() => handleRoleFilter('admin')}
            >
              Admins
            </button>
            <button 
              className={`btn ${selectedRole === 'execom' ? 'btn-primary' : 'btn-outline-primary'} px-4`} 
              onClick={() => handleRoleFilter('execom')}
            >
              Execom
            </button>
            <button 
              className={`btn ${selectedRole === 'member' ? 'btn-info' : 'btn-outline-info'} px-4`} 
              onClick={() => handleRoleFilter('member')}
            >
              Members
            </button>
          </div>
        </div>

        <div className="row gy-4">
          {filteredMembers.map((member, index) => {
            const style = getRoleStyle(member.role);
            const animationDelay = `${index * 0.1}s`;
            
            return (
              <div 
                className="col-md-6 col-lg-4" 
                key={member._id}
                style={{
                  opacity: animation ? 1 : 0,
                  transform: animation ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.4s ease',
                  transitionDelay: animationDelay
                }}
              >
                <div className={`card h-100 shadow border-start border-5 ${style.border} hover-shadow`}>
                  <div className="card-body position-relative p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center ${style.bg}`} style={{ width: '48px', height: '48px' }}>
                        <span className="fw-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h5 className="card-title mb-0 fw-bold">{member.name}</h5>
                        <small className="text-muted">{member.domain}</small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="card-text mb-2 d-flex align-items-center">
                        <Envelope className="me-2 text-secondary" />
                        <a href={`mailto:${member.email}`} className="text-decoration-none text-dark">
                          {member.email}
                        </a>
                      </p>
                      <p className="card-text mb-2 d-flex align-items-center">
                        <Telephone className="me-2 text-secondary" />
                        <a href={`tel:${member.phone}`} className="text-decoration-none text-dark">
                          {member.phone}
                        </a>
                      </p>
                      <p className="card-text mb-2 d-flex align-items-center">
                        <Grid3x3 className="me-2 text-secondary" />
                        {member.domain}
                      </p>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <RoleBadge role={member.role} />
                      
                      <Dropdown drop="start">
                        <Dropdown.Toggle variant="light" className="rounded-circle p-2 shadow-sm border-0">
                          <ThreeDotsVertical size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow border-0">
                          <h6 className="dropdown-header">Change Role</h6>
                          <Dropdown.Item 
                            onClick={() => updateMemberRole(member._id, 'admin')}
                            className={member.role === 'admin' ? 'active' : ''}
                          >
                            <span className="badge bg-danger me-2"></span> Admin
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => updateMemberRole(member._id, 'execom')}
                            className={member.role === 'execom' ? 'active' : ''}
                          >
                            <span className="badge bg-primary me-2"></span> Execom
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => updateMemberRole(member._id, 'member')}
                            className={member.role === 'member' ? 'active' : ''}
                          >
                            <span className="badge bg-info me-2"></span> Member
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No members found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMembers;


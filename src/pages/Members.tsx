import React, { useEffect, useState } from 'react';
import { 
  ThreeDotsVertical,  
  Telephone, 
  Envelope, 
  Calendar3,
  PersonBadge,
} from 'react-bootstrap-icons';

// Mock axios for demo
import axios from '../axiosConfig';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePic?: string;
  semester: number;
  class: string;
  role: string;
  createdAt: string;
}

const ViewMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/users/members');
        setMembers(response.data);
        setTimeout(() => {
          setLoading(false);
        }, 400);
      } catch (error) {
        console.error("Error fetching members", error);
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const filteredMembers =
    selectedRole === 'all' ? members : members.filter(member => member.role === selectedRole);

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await axios.patch(`/users/${memberId}/role`, { newRole });
      setMembers(prev =>
        prev.map(m => (m._id === memberId ? { ...m, role: newRole } : m))
      );
      setDropdownOpen(null);
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Could not update role. Try again later.");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'execom':
        return '#3b82f6';
      case 'member':
      default:
        return '#14b8a6';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-cyan" style={{ width: '4.5rem', height: '4.5rem' }} />
          <p className="mt-4 fs-4 text-white opacity-75">Loading Members...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="container-fluid px-4 py-5">

          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-gradient mb-3">Team Members</h1>
            <p className="lead text-white opacity-80">Manage and view all team members</p>
          </div>

          {/* Role Filter Buttons */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
            <button
              onClick={() => handleRoleFilter('all')}
              className={`role-filter-btn ${selectedRole === 'all' ? 'active' : ''}`}
            >
              All Members
            </button>
            <button
              onClick={() => handleRoleFilter('admin')}
              className={`role-filter-btn ${selectedRole === 'admin' ? 'active admin-filter' : ''}`}
            >
              Admins
            </button>
            <button
              onClick={() => handleRoleFilter('execom')}
              className={`role-filter-btn ${selectedRole === 'execom' ? 'active execom-filter' : ''}`}
            >
              Execom
            </button>
            <button
              onClick={() => handleRoleFilter('member')}
              className={`role-filter-btn ${selectedRole === 'member' ? 'active member-filter' : ''}`}
            >
              Members
            </button>
          </div>

          {/* Members Grid */}
          <div className="row g-4">
            {filteredMembers.map((member, idx) => {
              const roleColor = getRoleColor(member.role);
              const isDropdownOpen = dropdownOpen === member._id;

              return (
                <div key={member._id} className="col-12 col-md-6 col-xl-4">
                  <div
                    className="member-card h-100"
                    style={{
                      animation: `fadeUp 0.6s ease-out forwards`,
                      animationDelay: `${idx * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    {/* Card Header */}
                    <div className="member-card-header" style={{ 
                      background: `linear-gradient(135deg, ${roleColor}22 0%, ${roleColor}11 100%)`,
                      borderBottom: `2px solid ${roleColor}66`
                    }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          {member.profilePic ? (
                            <img 
                              src={member.profilePic} 
                              alt={member.name}
                              className="member-avatar"
                              style={{ border: `3px solid ${roleColor}` }}
                            />
                          ) : (
                            <div 
                              className="member-avatar-fallback"
                              style={{ 
                                background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}cc 100%)`,
                                boxShadow: `0 4px 15px ${roleColor}66`
                              }}
                            >
                              <span className="fw-bold text-white fs-4">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="member-name mb-1">{member.name}</h4>
                            <span className="semester-badge" style={{ 
                              background: `${roleColor}33`,
                              color: roleColor,
                              border: `1px solid ${roleColor}66`
                            }}>
                              S{member.semester} {member.class}
                            </span>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <span className="role-badge" style={{ 
                          background: roleColor,
                          boxShadow: `0 4px 15px ${roleColor}66`
                        }}>
                          <PersonBadge size={14} className="me-1" />
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="member-card-body">
                      {/* Contact Info */}
                      <div className="contact-section">
                        <div className="contact-item">
                          <Envelope size={18} style={{ color: roleColor }} />
                          <a href={`mailto:${member.email}`} className="contact-link">
                            {member.email}
                          </a>
                        </div>
                        <div className="contact-item">
                          <Telephone size={18} style={{ color: roleColor }} />
                          <a href={`tel:${member.phone}`} className="contact-link">
                            {member.phone}
                          </a>
                        </div>
                        <div className="contact-item">
                          <Calendar3 size={18} style={{ color: roleColor }} />
                          <span className="text-white-50">
                            Joined {formatJoinedDate(member.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="member-card-footer">
                      <div className="position-relative">
                        <button
                          onClick={() => setDropdownOpen(isDropdownOpen ? null : member._id)}
                          className="dropdown-toggle-btn"
                        >
                          <ThreeDotsVertical size={18} />
                          Change Role
                        </button>

                        {isDropdownOpen && (
                          <div className="custom-dropdown">
                            <div className="dropdown-header">Change Role</div>
                            <button
                              onClick={() => updateMemberRole(member._id, 'admin')}
                              className="dropdown-item-custom"
                              style={{ '--role-color': '#ef4444' } as React.CSSProperties}
                            >
                              <span className="role-dot" style={{ background: '#ef4444' }}></span>
                              Admin
                            </button>
                            <button
                              onClick={() => updateMemberRole(member._id, 'execom')}
                              className="dropdown-item-custom"
                              style={{ '--role-color': '#3b82f6' } as React.CSSProperties}
                            >
                              <span className="role-dot" style={{ background: '#3b82f6' }}></span>
                              Execom
                            </button>
                            <button
                              onClick={() => updateMemberRole(member._id, 'member')}
                              className="dropdown-item-custom"
                              style={{ '--role-color': '#14b8a6' } as React.CSSProperties}
                            >
                              <span className="role-dot" style={{ background: '#14b8a6' }}></span>
                              Member
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-5">
              <p className="text-white opacity-75 fs-5">No members found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        /* Text Gradient */
        .text-gradient { 
          background: linear-gradient(90deg, #00d4ff, #ff6bcb); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
        }

        .text-cyan { 
          color: #00d4ff; 
        }

        /* Role Filter Buttons */
        .role-filter-btn {
          padding: 12px 28px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 15px;
          border: 2px solid rgba(0, 212, 255, 0.4);
          background: rgba(15, 12, 41, 0.85);
          color: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .role-filter-btn:hover {
          border-color: rgba(0, 212, 255, 0.8);
          background: rgba(0, 212, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
        }

        .role-filter-btn.active {
          background: linear-gradient(135deg, #00d4ff 0%, #ff6bcb 100%);
          border-color: transparent;
          color: #000;
          font-weight: 700;
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5);
          transform: translateY(-2px);
        }

        .role-filter-btn.active.admin-filter {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
        }

        .role-filter-btn.active.execom-filter {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
        }

        .role-filter-btn.active.member-filter {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          box-shadow: 0 8px 25px rgba(20, 184, 166, 0.5);
        }

        /* Member Cards */
        .member-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .member-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 212, 255, 0.25);
          border-color: rgba(0, 212, 255, 0.4);
        }

        .member-card-header {
          padding: 24px;
        }

        .member-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .member-avatar-fallback {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-name {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .semester-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .role-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .member-card-body {
          padding: 24px;
        }

        /* Contact Section */
        .contact-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 14px;
        }

        .contact-link {
          color: #fff;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .contact-link:hover {
          color: #00d4ff;
        }

        /* Card Footer */
        .member-card-footer {
          padding: 20px 24px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-toggle-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .dropdown-toggle-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
        }

        /* Custom Dropdown */
        .custom-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          margin-bottom: 8px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 100;
          animation: dropdownFade 0.2s ease-out;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 8px 12px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 4px;
        }

        .dropdown-item-custom {
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dropdown-item-custom:hover {
          background: var(--role-color, rgba(255, 255, 255, 0.1));
          transform: translateX(4px);
        }

        .role-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </>
  );
};

export default ViewMembers;
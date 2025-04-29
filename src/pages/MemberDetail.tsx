import React, { useState, useEffect } from "react";
import { Button, Card, Badge, ProgressBar, Tabs, Tab, Image, Spinner, Alert } from "react-bootstrap";
import { 
  FaMailBulk, 
  FaPhoneAlt, 
  FaMapPin, 
  FaTrophy, 
  FaCalendarAlt, 
  FaArrowLeft,
  FaGithub,
  FaLinkedin,
  FaCode
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import axios from "../axiosConfig";

export default function MemberDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/users/profile`,{
          withCredentials
        });
        setUser(response.data);
        
        // Fetch events data
        if (response.data.eventsRegistered?.length > 0 || response.data.eventsAttended?.length > 0) {
          const eventsResponse = await axios.get(`/api/events/user/${id}`);
          setEvents(eventsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Helper function to get event details by ID
  const getEventById = (eventId) => {
    return events.find(event => event._id === eventId) || {};
  };

  // Calculate activity metrics
  const calculateMetrics = () => {
    if (!user) return null;
    
    const eventsAttendedCount = user.eventsAttended?.length || 0;
    const eventsRegisteredCount = user.eventsRegistered?.length || 0;
    
    // For workshops and projects, we'll use placeholders since they're optional fields
    const workshopsCompleted = user.workshopsCompleted?.length || 0;
    const workshopsTotal = 10; // Placeholder, would ideally come from an API
    
    const projectsContributed = user.projectsContributed?.length || 0;
    const projectsTotal = 5; // Placeholder
    
    // For competitions, we'll use a placeholder as well
    const competitionsParticipated = 3; // Placeholder
    const competitionsTotal = 3; // Placeholder
    
    return {
      eventsAttended: {
        count: eventsAttendedCount,
        total: eventsRegisteredCount > 0 ? eventsRegisteredCount : eventsAttendedCount + 3, // Placeholder total
        percentage: eventsRegisteredCount > 0 ? (eventsAttendedCount / eventsRegisteredCount) * 100 : 100
      },
      workshopsCompleted: {
        count: workshopsCompleted,
        total: workshopsTotal,
        percentage: (workshopsCompleted / workshopsTotal) * 100
      },
      projectsContributed: {
        count: projectsContributed,
        total: projectsTotal,
        percentage: (projectsContributed / projectsTotal) * 100
      },
      competitionsParticipated: {
        count: competitionsParticipated,
        total: competitionsTotal,
        percentage: (competitionsParticipated / competitionsTotal) * 100
      }
    };
  };

  // Function to render class and semester as department
  const renderDepartment = () => {
    if (!user?.class || !user?.semester) return "N/A";
    
    const classMap = {
      'CSA': 'Computer Science A',
      'CSB': 'Computer Science B',
      'CSC': 'Computer Science C',
      'CSD': 'Computer Science D',
      'EC': 'Electronics & Communication',
      'EI': 'Electronics & Instrumentation',
      'EE': 'Electrical Engineering',
      'ME': 'Mechanical Engineering',
      'CE': 'Civil Engineering'
    };
    
    return `${classMap[user.class] || user.class}, Semester ${user.semester}`;
  };

  // Calculate member since date
  const getMemberSinceDate = () => {
    if (!user?.createdAt) return "N/A";
    const date = new Date(user.createdAt);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  // Function to get badge color based on role
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'execom': return 'primary';
      case 'member': return 'success';
      default: return 'secondary';
    }
  };

  // Render role with better formatting
  const formatRole = (role) => {
    if (!role) return '';
    
    const roleMap = {
      'admin': 'Administrator',
      'execom': 'Executive Committee',
      'member': 'Club Member',
      'participant': 'Participant'
    };
    
    return roleMap[role] || role;
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="primary" as={Link} to="/admin/members">
          Back to Members
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <Alert variant="warning">
          User not found.
        </Alert>
        <Button variant="primary" as={Link} to="/admin/members">
          Back to Members
        </Button>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3">
        <Button variant="outline-secondary" size="sm" as={Link} to="/admin/members">
          <FaArrowLeft className="me-2" />
          Back
        </Button>
        <div>
          <h1 className="h3">Member Profile</h1>
          <p className="text-muted">View and manage member information</p>
        </div>
      </div>

      <div className="row mt-4">
        {/* Profile Section */}
        <div className="col-md-4">
          <Card>
            <Card.Body className="text-center">
              <Image 
                className="rounded-circle" 
                src={user.profilePic || "https://via.placeholder.com/150"} 
                style={{ width: "6rem", height: "6rem", objectFit: "cover" }} 
                alt={user.name}
              />
              
              <div className="mt-3">
                <h4>{user.name}</h4>
                <Badge bg={getRoleBadgeColor(user.role)}>{formatRole(user.role)}</Badge>
                <p className="text-muted">{renderDepartment()}</p>
                <p className="text-muted">Member since {getMemberSinceDate()}</p>
                {user.membershipId && <p className="text-muted">ID: {user.membershipId}</p>}
              </div>

              <div className="mt-3">
                <p><FaMailBulk className="me-2" /> {user.email}</p>
                {user.phone && <p><FaPhoneAlt className="me-2" /> {user.phone}</p>}
                {user.address && <p><FaMapPin className="me-2" /> {user.address}</p>}
              </div>

              {/* Social Links */}
              <div className="mt-3">
                {(user.githubLink || user.linkedinLink) && (
                  <div className="d-flex justify-content-center gap-3">
                    {user.githubLink && (
                      <a href={user.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-dark">
                        <FaGithub className="me-1" /> GitHub
                      </a>
                    )}
                    {user.linkedinLink && (
                      <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                        <FaLinkedin className="me-1" /> LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Skills Section */}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-4">
                  <h5>Skills</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} pill bg="light" text="dark">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements Section */}
              {user.achievements && user.achievements.length > 0 && (
                <div className="mt-4">
                  <h5>Achievements</h5>
                  <div className="d-flex justify-content-around">
                    {user.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="text-center">
                        <FaTrophy size={24} className="mb-1 text-primary" />
                        <div className="text-muted">{achievement.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button variant="primary" className="w-100" as={Link} to={`/admin/members/edit/${user._id}`}>Edit Profile</Button>
                <Button variant="outline-secondary" className="w-100 mt-2">Reset Password</Button>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Activity Overview Section */}
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h5>Activity Overview</h5>
              <p className="text-muted">Member's engagement with the club</p>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Events Attended</span>
                  <span>{metrics.eventsAttended.count}/{metrics.eventsAttended.total}</span>
                </div>
                <ProgressBar now={metrics.eventsAttended.percentage} />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Workshops Completed</span>
                  <span>{metrics.workshopsCompleted.count}/{metrics.workshopsCompleted.total}</span>
                </div>
                <ProgressBar now={metrics.workshopsCompleted.percentage} />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Projects Contributed</span>
                  <span>{metrics.projectsContributed.count}/{metrics.projectsContributed.total}</span>
                </div>
                <ProgressBar now={metrics.projectsContributed.percentage} />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Competitions Participated</span>
                  <span>{metrics.competitionsParticipated.count}/{metrics.competitionsParticipated.total}</span>
                </div>
                <ProgressBar now={metrics.competitionsParticipated.percentage} />
              </div>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Tabs defaultActiveKey="attendance" id="profile-tabs" className="mt-4">
            <Tab eventKey="attendance" title="Attendance">
              <Card className="mt-3">
                <Card.Header>
                  <h5>Attendance History</h5>
                  <p className="text-muted">Record of event attendance</p>
                </Card.Header>
                <Card.Body>
                  {user.eventsRegistered && user.eventsRegistered.length > 0 ? (
                    user.eventsRegistered.map((eventId, index) => {
                      const event = getEventById(eventId);
                      const isAttended = user.eventsAttended?.includes(eventId);
                      return (
                        <div key={index} className="d-flex justify-content-between mb-3 align-items-center">
                          <div>
                            <strong>{event.title || 'Event'}</strong>
                            <div className="text-muted">
                              <FaCalendarAlt size={14} className="me-1" />
                              {event.date ? new Date(event.date).toLocaleDateString() : 'Date not available'}
                            </div>
                          </div>
                          <Badge bg={isAttended ? 'success' : 'secondary'}>
                            {isAttended ? 'Attended' : 'Registered'}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No event registrations found</p>
                    </div>
                  )}
                </Card.Body>
                {user.eventsRegistered && user.eventsRegistered.length > 0 && (
                  <Card.Footer>
                    <Button variant="outline-secondary" size="sm">View All Records</Button>
                  </Card.Footer>
                )}
              </Card>
            </Tab>

            <Tab eventKey="projects" title="Projects">
              <Card className="mt-3">
                <Card.Header>
                  <h5>Project Contributions</h5>
                  <p className="text-muted">Projects the member has contributed to</p>
                </Card.Header>
                <Card.Body>
                  {user.projectsContributed && user.projectsContributed.length > 0 ? (
                    user.projectsContributed.map((project, index) => (
                      <div key={index} className="d-flex justify-content-between mb-3 align-items-center">
                        <div>
                          <strong>{project.project?.title || project.title || 'Project'}</strong>
                          <div className="text-muted">
                            <FaCode size={14} className="me-1" />
                            {project.role || 'Contributor'}
                          </div>
                        </div>
                        <Button variant="outline-primary" size="sm">View Project</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No project contributions found</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="notes" title="Admin Notes">
              <Card className="mt-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5>Admin Notes</h5>
                  <Button variant="outline-primary" size="sm">Add Note</Button>
                </Card.Header>
                <Card.Body>
                  {user.adminNotes && user.adminNotes.length > 0 ? (
                    user.adminNotes.map((note, index) => (
                      <div key={index} className="border-bottom pb-3 mb-3">
                        <p>{note.note}</p>
                        <div className="d-flex justify-content-between text-muted small">
                          <span>Added by: {note.createdBy?.name || 'Admin'}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No admin notes found</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
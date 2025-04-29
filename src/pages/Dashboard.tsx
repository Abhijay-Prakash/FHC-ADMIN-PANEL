import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Table, Spinner, Alert } from "react-bootstrap";

// Type definitions
type Event = {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
};

type Stats = {
  totalUsers: number;
  totalEvents: number;
  totalBYTEParticipants: number;
};

type AttendanceRecord = {
  _id: string;
  name: string;
  date: string;
  domain: string;
};

type Member = {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
};

// Domain configuration
const domainConfig: Record<string, { color: string; icon: string }> = {
  webdev: { color: "#4e73df", icon: "bi-globe2" },
  backend: { color: "#1cc88a", icon: "bi-server" },
  react: { color: "#6f42c1", icon: "bi-code-square" },
  ml: { color: "#f6c23e", icon: "bi-cpu" },
  default: { color: "#36b9cc", icon: "bi-book" }
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [newMembers, setNewMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, eventsRes, attendanceRes, membersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard/stats", { withCredentials: true }),
        axios.get("http://localhost:5000/api/dashboard/events/upcoming", { withCredentials: true }),
        axios.get("http://localhost:5000/api/dashboard/attendance/recent", { withCredentials: true }),
        axios.get("http://localhost:5000/api/dashboard/members/new", { withCredentials: true }),
      ]);

      setStats(statsRes.data);
      setUpcomingEvents(eventsRes.data?.events || eventsRes.data || []);
      setRecentAttendance(attendanceRes.data?.attendance || attendanceRes.data || []);
      setNewMembers(membersRes.data?.members || membersRes.data || []);
      
      // Set last updated time
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(intervalId);
  }, []);

  // Get domain badge style
  const getDomainBadge = (domain: string) => {
    const config = domainConfig[domain.toLowerCase()] || domainConfig.default;
    return (
      <Badge 
        style={{ 
          backgroundColor: `${config.color}22`, 
          color: config.color,
          padding: "0.5rem 0.75rem",
          fontWeight: "500",
          borderRadius: "0.5rem"
        }}
      >
        <i className={`bi ${config.icon} me-1`}></i> {domain}
      </Badge>
    );
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !stats && !error) {
    return (
      <div className="loading-container d-flex flex-column align-items-center justify-content-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-3 p-md-4">
      {/* Dashboard Header */}
      <div className="dashboard-header mb-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="bi bi-speedometer2 me-2 text-primary"></i>
              Admin Dashboard
            </h2>
            <p className="text-muted mb-md-0">Overview of system stats, events, and member activities</p>
          </div>
          <div className="d-flex align-items-center mt-2 mt-md-0">
            <span className="text-muted me-2 small">Last updated: {lastUpdated}</span>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <i className={`bi ${loading ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'} me-1`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col xs={12} md={4}>
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body style={{ background: "linear-gradient(135deg, #4e73df11 0%, #4e73df22 100%)" }}>
                <div className="d-flex align-items-center">
                  <div className="icon-container me-3" style={{ background: "#4e73df" }}>
                    <i className="bi bi-people-fill text-white"></i>
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">Total Users</div>
                    <div className="h3 mb-0 fw-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body style={{ background: "linear-gradient(135deg, #1cc88a11 0%, #1cc88a22 100%)" }}>
                <div className="d-flex align-items-center">
                  <div className="icon-container me-3" style={{ background: "#1cc88a" }}>
                    <i className="bi bi-calendar2-event-fill text-white"></i>
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">Total Events</div>
                    <div className="h3 mb-0 fw-bold">{stats?.totalEvents?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body style={{ background: "linear-gradient(135deg, #6f42c111 0%, #6f42c122 100%)" }}>
                <div className="d-flex align-items-center">
                  <div className="icon-container me-3" style={{ background: "#6f42c1" }}>
                    <i className="bi bi-laptop-fill text-white"></i>
                  </div>
                  <div>
                    <div className="text-muted small text-uppercase fw-bold">BYTE Participants</div>
                    <div className="h3 mb-0 fw-bold">{stats?.totalBYTEParticipants?.toLocaleString() || 0}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="g-3 mb-4">
        {/* Upcoming Events */}
        <Col xs={12} lg={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-calendar-event me-2 text-primary"></i>
                  Upcoming Events
                </h5>
                <Badge bg="primary" pill className="px-3">
                  {upcomingEvents.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="pt-0 pb-2">
              {upcomingEvents.length > 0 ? (
                <div className="events-container">
                  {upcomingEvents.map((event) => (
                    <Card 
                      key={event._id} 
                      className="event-card mb-3 border-0 shadow-sm"
                    >
                      <Card.Body>
                        <div className="d-flex align-items-start">
                          <div className="event-date me-3 text-center">
                            <div className="event-month text-uppercase text-white small fw-bold">
                              {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                            </div>
                            <div className="event-day fw-bold">
                              {new Date(event.date).getDate()}
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-1">{event.title}</h6>
                            <div className="small text-muted mb-2">
                              <i className="bi bi-clock me-1"></i> {event.time}
                              <span className="ms-3"><i className="bi bi-geo-alt me-1"></i> {event.location}</span>
                            </div>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-eye me-1"></i> View
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                <i className="bi bi-pencil me-1"></i> Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x text-muted mb-2" style={{ fontSize: "2rem" }}></i>
                  <p className="text-muted mb-0">No upcoming events scheduled</p>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center border-0 pt-0">
              <button className="btn btn-sm btn-outline-primary">
                <i className="bi bi-plus me-1"></i> Add New Event
              </button>
            </Card.Footer>
          </Card>
        </Col>

        {/* Recent Attendance */}
        <Col xs={12} lg={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  Recent BYTE Attendance
                </h5>
                <Badge bg="primary" pill className="px-3">
                  {recentAttendance.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentAttendance.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Name</th>
                        <th>Domain</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((record) => (
                        <tr key={record._id}>
                          <td className="ps-3 align-middle">
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-2">
                                {record.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{record.name}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            {getDomainBadge(record.domain)}
                          </td>
                          <td className="align-middle">{formatDate(record.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x text-muted mb-2" style={{ fontSize: "2rem" }}></i>
                  <p className="text-muted mb-0">No recent attendance records</p>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center border-0">
              <button className="btn btn-sm btn-outline-primary">
                <i className="bi bi-download me-1"></i> Export Attendance Data
              </button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* New Members */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-person-plus me-2 text-primary"></i>
              New Members
            </h5>
            <Badge bg="primary" pill className="px-3">
              {newMembers.length}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {newMembers.length > 0 ? (
            <Row className="g-3">
              {newMembers.map((member) => (
                <Col key={member._id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="member-card h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-3">
                      <div className="position-relative mb-3">
                        <div className="member-avatar mx-auto">
                          {member.profilePic ? (
                            <img
                              src={member.profilePic}
                              alt={member.name}
                              className="img-fluid rounded-circle"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="member-status online"></div>
                      </div>
                      <h5 className="member-name fw-bold mb-1">{member.name}</h5>
                      <p className="member-email text-muted small mb-3">{member.email}</p>
                      <div className="d-flex justify-content-center">
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-person-lines-fill"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary me-2">
                          <i className="bi bi-envelope"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-people text-muted mb-2" style={{ fontSize: "2rem" }}></i>
              <p className="text-muted mb-0">No new members yet</p>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white text-center border-0">
          <button className="btn btn-sm btn-outline-primary">
            <i className="bi bi-people me-1"></i> View All Members
          </button>
        </Card.Footer>
      </Card>

      {/* Custom CSS */}
      <style jsx>{`
        /* Global Styles */
        .loading-container {
          height: 80vh;
        }
        
        .icon-container {
          height: 3rem;
          width: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        /* Card Styles */
        .stat-card, .event-card, .member-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .stat-card:hover, .event-card:hover, .member-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Event Styles */
        .events-container {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .event-date {
          width: 60px;
          height: 60px;
          background: #f8f9fa;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .event-month {
          background: #4e73df;
          padding: 2px 0;
        }
        
        .event-day {
          font-size: 1.5rem;
          line-height: 38px;
        }
        
        /* Avatar Styles */
        .avatar-circle {
          width: 32px;
          height: 32px;
          background-color: #4e73df;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .member-avatar {
          width: 80px;
          height: 80px;
          position: relative;
        }
        
        .avatar-placeholder {
          width: 80px;
          height: 80px;
          background-color: #4e73df;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 2rem;
          font-weight: bold;
        }
        
        .member-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .member-status.online {
          background-color: #1cc88a;
        }
        
        /* Animation */
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default AdminDashboard;
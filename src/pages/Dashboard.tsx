import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Table, 
  Spinner, 
  Alert,
  ProgressBar,
  Button,
  OverlayTrigger,
  Tooltip,
  Navbar,
  Nav
} from "react-bootstrap";

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [statsRes, eventsRes, attendanceRes, membersRes] = await Promise.all([
        axios.get("/dashboard/stats", { withCredentials: true }),
        axios.get("/dashboard/events/upcoming", { withCredentials: true }),
        axios.get("/dashboard/attendance/recent", { withCredentials: true }),
        axios.get("/dashboard/members/new", { withCredentials: true }),
      ]);

      setStats(statsRes.data);
      setUpcomingEvents(eventsRes.data?.events || []);
      setRecentAttendance(attendanceRes.data?.attendance || []);
      setNewMembers(membersRes.data?.members || []);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const getDomainBadge = (domain: string) => {
    const config = domainConfig[domain.toLowerCase()] || domainConfig.default;
    return (
      <Badge 
        style={{ backgroundColor: `${config.color}22`, color: config.color }} 
        className="fw-medium px-3 py-2 rounded-pill"
      >
        <i className={`bi ${config.icon} me-1`}></i> {domain}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !stats && !error) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="mt-3 text-muted">Loading dashboard data...</h5>
        </div>
      </div>
    );
  }

  // Calculate percentages for visual representation
  const bytePercentage = stats?.totalUsers ? Math.round((stats.totalBYTEParticipants / stats.totalUsers) * 100) : 0;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold d-flex align-items-center">
            <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i> Admin Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <div className="d-flex align-items-center">
                <span className="text-muted me-2">
                  <i className="bi bi-clock me-1"></i>
                  Last updated: {lastUpdated}
                </span>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={fetchDashboardData} 
                  disabled={refreshing}
                  className="d-flex align-items-center"
                >
                  <i className={`bi ${refreshing ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-2`}></i>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="px-4">
        {error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {stats && (
          <Row className="mb-4 g-3">
            <Col lg={4} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <i className="bi bi-people-fill text-primary" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Users</h6>
                      <h3 className="mb-0 fw-bold">{stats?.totalUsers?.toLocaleString() || 0}</h3>
                    </div>
                  </div>
                  <ProgressBar now={100} variant="primary" className="mb-2" style={{ height: "5px" }} />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    All registered platform users
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <i className="bi bi-calendar-event-fill text-success" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Events</h6>
                      <h3 className="mb-0 fw-bold">{stats?.totalEvents?.toLocaleString() || 0}</h3>
                    </div>
                  </div>
                  <ProgressBar now={100} variant="success" className="mb-2" style={{ height: "5px" }} />
                  <small className="text-muted">
                    <i className="bi bi-calendar-check me-1"></i>
                    Events hosted on the platform
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <i className="bi bi-award-fill text-warning" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">BYTE Participants</h6>
                      <h3 className="mb-0 fw-bold">{stats?.totalBYTEParticipants?.toLocaleString() || 0}</h3>
                    </div>
                  </div>
                  <ProgressBar now={bytePercentage} variant="warning" className="mb-2" style={{ height: "5px" }} />
                  <small className="text-muted">
                    <i className="bi bi-person-check me-1"></i>
                    {bytePercentage}% of all users
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row className="mb-4 g-3">
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-calendar-week text-primary me-2"></i>
                    Upcoming Events
                  </h5>
                  <Badge bg="primary" pill>
                    {upcomingEvents.length}
                  </Badge>
                </div>
                <hr />
              </Card.Header>
              <Card.Body className="pt-0">
                {upcomingEvents.length ? (
                  <div className="list-group list-group-flush">
                    {upcomingEvents.map(ev => (
                      <div key={ev._id} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex">
                          <div className="bg-light rounded text-center p-2 me-3" style={{ minWidth: "60px" }}>
                            <div className="small text-uppercase fw-bold text-muted">
                              {new Date(ev.date).toLocaleDateString(undefined, { month: 'short' })}
                            </div>
                            <div className="fw-bold fs-4">
                              {new Date(ev.date).getDate()}
                            </div>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{ev.title}</h6>
                            <div className="text-muted small">
                              <i className="bi bi-clock me-1"></i> {ev.time}
                              <i className="bi bi-geo-alt ms-3 me-1"></i> {ev.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: "2rem" }}></i>
                    <p className="text-muted mt-2">No upcoming events</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-person-plus text-success me-2"></i>
                    New Members
                  </h5>
                  <Badge bg="success" pill>
                    {newMembers.length}
                  </Badge>
                </div>
                <hr />
              </Card.Header>
              <Card.Body className="pt-0">
                {newMembers.length ? (
                  <div className="list-group list-group-flush">
                    {newMembers.map(m => (
                      <div key={m._id} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex align-items-center">
                          <img 
                            src={m.profilePic} 
                            alt={m.name} 
                            className="rounded-circle me-3" 
                            width="48" 
                            height="48"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <h6 className="fw-bold mb-0">{m.name}</h6>
                            <a href={`mailto:${m.email}`} className="text-muted small">
                              <i className="bi bi-envelope me-1"></i>{m.email}
                            </a>
                          </div>
                          <Button variant="outline-primary" size="sm" className="ms-auto">
                            <i className="bi bi-person-lines-fill me-1"></i> View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-people text-muted" style={{ fontSize: "2rem" }}></i>
                    <p className="text-muted mt-2">No new members</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-check2-square text-info me-2"></i>
                    Recent Attendance
                  </h5>
                  <Badge bg="info" pill>
                    {recentAttendance.length}
                  </Badge>
                </div>
                <hr />
              </Card.Header>
              <Card.Body className="p-0">
                {recentAttendance.length ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr className="bg-light">
                          <th className="fw-semibold border-0">Name</th>
                          <th className="fw-semibold border-0">Date</th>
                          <th className="fw-semibold border-0">Domain</th>
                          <th className="fw-semibold border-0 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAttendance.map(record => (
                          <tr key={record._id}>
                            <td className="fw-medium">{record.name}</td>
                            <td>{formatDate(record.date)}</td>
                            <td>{getDomainBadge(record.domain)}</td>
                            <td className="text-end">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>View Details</Tooltip>}
                              >
                                <Button variant="link" className="p-0 me-2 text-info">
                                  <i className="bi bi-eye-fill"></i>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Download Certificate</Tooltip>}
                              >
                                <Button variant="link" className="p-0 text-success">
                                  <i className="bi bi-file-earmark-pdf-fill"></i>
                                </Button>
                              </OverlayTrigger>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-clipboard-x text-muted" style={{ fontSize: "2rem" }}></i>
                    <p className="text-muted mt-2">No recent attendance records</p>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="bg-white border-top-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Showing most recent {recentAttendance.length} records</small>
                  <Button variant="outline-primary" size="sm">
                    View All Records <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        <footer className="text-center text-muted py-4">
          <small>&copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.</small>
        </footer>
      </Container>
    </div>
  );
};

export default AdminDashboard;
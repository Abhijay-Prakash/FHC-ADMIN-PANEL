// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Navbar, Nav } from "react-bootstrap";
import { 
  PeopleFill, 
  Calendar3, 
  Trophy, 
  Stars, 
  ArrowClockwise 
} from "react-bootstrap-icons";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

type Event = { _id: string; title: string; date: string; time: string; location: string; };
type Stats = { totalUsers: number; totalEvents: number; totalBYTEParticipants: number; };
type Member = { _id: string; name: string; email: string; profilePic: string; createdAt: string; };
type GrowthData = { month: string; users: number; newUsers?: number };

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [newMembers, setNewMembers] = useState<Member[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [statsRes, eventsRes, membersRes, growthRes] = await Promise.all([
        axios.get("/dashboard/stats", { withCredentials: true }),
        axios.get("/dashboard/events/upcoming", { withCredentials: true }),
        axios.get("/dashboard/members/new", { withCredentials: true }),
        axios.get("/members/growth", { withCredentials: true }), // Your endpoint
      ]);

      setStats(statsRes.data);
      setUpcomingEvents(eventsRes.data?.events || []);
      setNewMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      setGrowthData(growthRes.data.monthly || []);

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 < 4 && !(day >= 11 && day <= 13)) ? day % 10 : 0] || "th";
    return `${day}${suffix} ${date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  };

  const bytePercentage = stats?.totalUsers ? Math.round((stats.totalBYTEParticipants / stats.totalUsers) * 100) : 0;

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" style={{ width: "4rem", height: "4rem" }} />
          <h4 className="text-white opacity-75">Loading Dashboard...</h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <Navbar className="shadow-lg border-bottom border-primary border-opacity-25" style={{ background: "rgba(20, 20, 40, 0.7)", backdropFilter: "blur(12px)" }}>
          <Container fluid>
            <Navbar.Brand className="text-white fw-bold d-flex align-items-center gap-3">
              <Stars size={28} className="text-warning" />
              FHC Admin Portal
            </Navbar.Brand>
            <Nav className="ms-auto align-items-center gap-4">
              <span className="text-white small opacity-75">
                Last updated: {lastUpdated}
              </span>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="d-flex align-items-center gap-2"
              >
                <ArrowClockwise size={16} className={refreshing ? "spin" : ""} />
                Refresh
              </Button>
            </Nav>
          </Container>
        </Navbar>

        <Container fluid className="px-4 py-5">
          {error && <Alert variant="danger" className="border-danger">{error}</Alert>}

          {/* Stats Cards */}
          <Row className="g-4 mb-5">
            {[
              { icon: PeopleFill, label: "Total Users", value: stats?.totalUsers, color: "#00d4ff" },
              { icon: Calendar3, label: "Total Events", value: stats?.totalEvents, color: "#ff6bcb" },
              { icon: Trophy, label: "BYTE Participants", value: stats?.totalBYTEParticipants, color: "#39ff14", extra: `(${bytePercentage}%)` }
            ].map((item, i) => (
              <Col lg={4} key={i}>
                <Card className="h-100 border-0 overflow-hidden glass-card glow-hover">
                  <Card.Body className="text-center text-white p-5">
                    <item.icon size={60} style={{ color: item.color, filter: "drop-shadow(0 0 20px currentColor)" }} />
                    <h1 className="display-4 fw-bold mt-4 mb-2" style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>
                      {item.value?.toLocaleString() || 0}
                    </h1>
                    <p className="fs-5 opacity-90">{item.label}</p>
                    {item.extra && <span className="text-warning fw-bold">{item.extra}</span>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* User Growth Chart */}
          <Row className="g-4 mb-5">
            <Col xs={12}>
              <Card className="glass-card border-0">
                <Card.Header className="bg-transparent border-0 text-white d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0">
                    <PeopleFill className="me-2 text-cyan" size={26} />
                    User Growth Over Time
                  </h4>
                  <Badge bg="primary" pill className="fs-6">
                    {stats?.totalUsers?.toLocaleString()} Total
                  </Badge>
                </Card.Header>
                <Card.Body className="p-4">
                  {growthData.length === 0 ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-white opacity-60 mt-3">Loading growth data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="#ccc" style={{ fontSize: '0.9rem' }} />
                        <YAxis stroke="#ccc" style={{ fontSize: '0.9rem' }} />
                        <Tooltip 
                          contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid #00d4ff", borderRadius: "8px", backdropFilter: "blur(10px)" }}
                          labelStyle={{ color: "#00ffff", fontWeight: "bold" }}
                          formatter={(value: number) => value.toLocaleString()}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stroke="#00d4ff"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorGrowth)"
                          dot={{ fill: "#00d4ff", r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Upcoming Events + New Members */}
          <Row className="g-4">
            {/* Upcoming Events */}
            <Col lg={6}>
              <Card className="h-100 glass-card border-0">
                <Card.Header className="bg-transparent border-0 text-white">
                  <h4 className="fw-bold mb-0">Upcoming Events</h4>
                </Card.Header>
                <Card.Body>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-center text-white opacity-60 py-5">No upcoming events</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 5).map(ev => (
                        <div key={ev._id} className="glass-item p-4 rounded-3 d-flex align-items-center gap-4">
                          <div className="text-center text-white">
                            <div className="small opacity-75">{new Date(ev.date).toLocaleDateString('en-GB', { month: 'short' })}</div>
                            <div className="fs-3 fw-bold">{new Date(ev.date).getDate()}</div>
                          </div>
                          <div className="text-white flex-grow-1">
                            <h6 className="fw-bold mb-1">{ev.title}</h6>
                            <small className="opacity-75">{ev.time} • {ev.location}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* New Members */}
            <Col lg={6}>
              <Card className="h-100 glass-card border-0">
                <Card.Header className="bg-transparent border-0 text-white d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0">New Members</h4>
                  <Badge bg="success" className="fs-6 px-3 py-2">{newMembers.length}</Badge>
                </Card.Header>
                <Card.Body>
                  {newMembers.length === 0 ? (
                    <p className="text-center text-white opacity-60 py-5">No new members</p>
                  ) : (
                    <div className="space-y-3">
                      {newMembers.slice(0, 5).map((m, i) => (
                        <div key={m._id} className="glass-item p-4 rounded-3 d-flex align-items-center gap-4" style={{ animationDelay: `${i * 0.1}s` }}>
                          <img 
                            src={m.profilePic} 
                            alt={m.name}
                            className="rounded-circle"
                            width={60}
                            height={60}
                            style={{ border: "3px solid rgba(255,255,255,0.2)", objectFit: "cover" }}
                            onError={e => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff`)}
                          />
                          <div className="text-white flex-grow-1">
                            <h6 className="fw-bold mb-1">{m.name}</h6>
                            <small className="opacity-75 d-block">Joined {formatJoinedDate(m.createdAt)}</small>
                            <small className="text-cyan">{m.email}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s ease;
        }
        .glass-item {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        .glass-item:hover, .glow-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .text-cyan { color: #00ffff; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .space-y-3 > * + * { margin-top: 0.75rem; }
      `}</style>
    </>
  );
};

export default AdminDashboard;
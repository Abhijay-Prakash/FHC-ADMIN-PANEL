import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  Container,
  Badge,
  ProgressBar
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../axiosConfig";

// Domain Configuration
const domainConfig = {
  webdev: {
    name: "Web Development",
    color: "#4e73df",
    gradient: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
    icon: "bi bi-globe2",
    description: "Front-end design & development"
  },
  backend: {
    name: "Backend Development",
    color: "#1cc88a",
    gradient: "linear-gradient(135deg, #1cc88a 0%, #13855c 100%)",
    icon: "bi bi-server",
    description: "Server-side programming & APIs"
  },
  react: {
    name: "ReactJS Development",
    color: "#6f42c1",
    gradient: "linear-gradient(135deg, #6f42c1 0%, #4e2c94 100%)",
    icon: "bi bi-code-square",
    description: "Modern UI component development"
  },
  ml: {
    name: "Machine Learning",
    color: "#f6c23e",
    gradient: "linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)",
    icon: "bi bi-cpu",
    description: "AI & data science fundamentals"
  }
} as const;

type DomainKey = keyof typeof domainConfig;

type Stats = {
  [key in DomainKey]?: number;
};

type TopDomain = {
  name: string;
  count: number;
  key?: DomainKey;
};

export default function ByteDashboard() {
  const [stats, setStats] = useState<Stats>({});
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("Just Now");
  const [topDomain, setTopDomain] = useState<TopDomain>({
    name: "None",
    count: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get<Stats>("/byte/dashboard-stats", {
          withCredentials: true
        });

        setStats(data);

        const total = Object.values(data).reduce((sum, count) => sum + (count || 0), 0);
        setTotalRegistrations(total);

        if (Object.keys(data).length > 0) {
          const top = Object.keys(data).reduce((a, b) => (data[a as DomainKey] || 0) > (data[b as DomainKey] || 0) ? a : b) as DomainKey;
          setTopDomain({
            name: domainConfig[top].name,
            count: data[top] || 0,
            key: top
          });
        }

        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 300000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="loading-container d-flex flex-column align-items-center justify-content-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="px-3 py-4">
      {/* Header */}
      <div className="dashboard-header mb-4 p-3 bg-white rounded shadow-sm">
        <h2 className="fw-bold mb-1">
          <i className="bi bi-speedometer2 me-2 text-primary"></i>
          BYTE Class Overview
        </h2>
        <p className="text-muted mb-0">Monitor and manage class registrations across domains</p>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body style={{ background: "linear-gradient(135deg, #4e73df11 0%, #4e73df22 100%)" }}>
              <div className="d-flex align-items-center">
                <div className="icon-container me-3" style={{ background: "#4e73df", padding: "10px", borderRadius: "8px" }}>
                  <i className="bi bi-people-fill text-white"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-uppercase mb-1 text-muted">Total Registrations</div>
                  <div className="h3 mb-0 fw-bold">{totalRegistrations}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body style={{ background: "linear-gradient(135deg, #1cc88a11 0%, #1cc88a22 100%)" }}>
              <div className="d-flex align-items-center">
                <div className="icon-container me-3" style={{ background: "#1cc88a", padding: "10px", borderRadius: "8px" }}>
                  <i className="bi bi-collection-fill text-white"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-uppercase mb-1 text-muted">Active Domains</div>
                  <div className="h3 mb-0 fw-bold">{Object.keys(stats).length}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body style={{ background: "linear-gradient(135deg, #6f42c111 0%, #6f42c122 100%)" }}>
              <div className="d-flex align-items-center">
                <div className="icon-container me-3" style={{ background: "#6f42c1", padding: "10px", borderRadius: "8px" }}>
                  <i className="bi bi-clock-history text-white"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-uppercase mb-1 text-muted">Last Updated</div>
                  <div className="h3 mb-0 fw-bold">{lastUpdated}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body style={{ background: "linear-gradient(135deg, #f6c23e11 0%, #f6c23e22 100%)" }}>
              <div className="d-flex align-items-center">
                <div className="icon-container me-3" style={{ background: "#f6c23e", padding: "10px", borderRadius: "8px" }}>
                  <i className="bi bi-trophy-fill text-white"></i>
                </div>
                <div>
                  <div className="text-xs fw-bold text-uppercase mb-1 text-muted">Top Domain</div>
                  <div className="h3 mb-0 fw-bold">{topDomain.name}</div>
                  <div className="small text-muted">{topDomain.count} registrations</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Registration Distribution */}
      {Object.keys(stats).length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-0">
            <h5 className="mb-0">Registration Distribution</h5>
          </Card.Header>
          <Card.Body>
            {Object.keys(stats).map((domain) => {
              const count = stats[domain as DomainKey] || 0;
              const percentage = totalRegistrations ? Math.round((count / totalRegistrations) * 100) : 0;
              return (
                <div key={"progress-" + domain} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">{domainConfig[domain as DomainKey].name}</span>
                    <span className="badge bg-light text-dark">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    now={percentage}
                    style={{ height: "10px", backgroundColor: "#f8f9fc" }}
                  />
                </div>
              );
            })}
          </Card.Body>
        </Card>
      )}

      {/* Domain Cards */}
      <h5 className="mb-3">Domain Registration Details</h5>
      <Row className="g-3">
        {Object.keys(stats).map((domain) => {
          const key = domain as DomainKey;
          return (
            <Col xs={12} sm={6} lg={4} xl={3} key={key}>
              <Link to={`/byte-register/${key}`} className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm">
                  <div style={{ background: domainConfig[key].gradient, height: "6px" }}></div>
                  <Card.Body className="position-relative">
                    <div
                      className="domain-icon mb-3"
                      style={{
                        backgroundColor: domainConfig[key].color,
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <i className={`${domainConfig[key].icon} text-white`}></i>
                    </div>

                    <div className="mb-2">
                      <div className="h5 fw-bold">{domainConfig[key].name}</div>
                      <p className="text-muted small mb-0">{domainConfig[key].description}</p>
                    </div>

                    <hr className="my-3" />

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="h2 mb-0 fw-bold">{stats[key]}</div>
                        <div className="text-muted small">Registrations</div>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: `${domainConfig[key].color}22`,
                          color: domainConfig[key].color
                        }}
                      >
                        {key.toUpperCase()}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

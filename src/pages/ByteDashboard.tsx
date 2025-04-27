import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const domainNames = {
  webdev: "Web Development",
  backend: "Backend Development",
  react: "ReactJS Development",
  ml: "Machine Learning"
};

export default function ByteDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/byte/dashboard-stats", 
            {
                withCredentials: true
            }
        );
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  return (
    <div className="p-4" style={{ marginLeft: "250px" }}>
      <h2 className="mb-4">BYTE Class Overview</h2>
      <Row>
        {Object.keys(stats).map((domain) => (
          <Col md={6} lg={4} key={domain} className="mb-4">
            <Link to={`/byte-register/${domain}`} className="text-decoration-none">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{domainNames[domain]}</Card.Title>
                  <Card.Text>
                    <strong>Registrations:</strong> {stats[domain]}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}

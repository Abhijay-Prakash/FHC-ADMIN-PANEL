import React from "react";
import { Button, Card, Badge, ProgressBar, Tabs, Tab, Image } from "react-bootstrap"; // Image component instead of Avatar
import { FaMailBulk, FaPhoneAlt, FaMapPin, FaTrophy, FaCalendarAlt, FaArrowLeft } from "react-icons/fa"; // Use FaArrowLeft instead of ArrowLeft
import { Link } from "react-router-dom"; // Use Link from react-router-dom for navigation

export default function MemberDetailPage() {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3">
        <Button variant="outline-secondary" size="sm" as={Link} to="/admin/members"> {/* React Router Link */}
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
              <Image className="rounded-circle" src="https://via.placeholder.com/150" style={{ width: "6rem", height: "6rem" }} /> {/* Replace with actual profile image */}
              
              <div className="mt-3">
                <h4>Alex Johnson</h4>
                <Badge bg="primary">Club President</Badge>
                <p className="text-muted">Computer Science</p>
                <p className="text-muted">Member since Jan 2022</p>
              </div>

              <div className="mt-3">
                <p><FaMailBulk className="me-2" /> alex.j@example.com</p>
                <p><FaPhoneAlt className="me-2" /> +1 (555) 123-4567</p>
                <p><FaMapPin className="me-2" /> Campus Housing, Block A</p>
              </div>

              <div className="mt-4">
                <h5>Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  <Badge pill variant="outline-primary">React</Badge>
                  <Badge pill variant="outline-primary">Next.js</Badge>
                  <Badge pill variant="outline-primary">TypeScript</Badge>
                  <Badge pill variant="outline-primary">UI/UX</Badge>
                  <Badge pill variant="outline-primary">Python</Badge>
                  <Badge pill variant="outline-primary">Leadership</Badge>
                </div>
              </div>

              <div className="mt-4">
                <h5>Achievements</h5>
                <div className="d-flex justify-content-around">
                  <div className="text-center">
                    <FaTrophy size={24} className="mb-1 text-primary" />
                    <div className="text-muted">Top Contributor</div>
                  </div>
                  <div className="text-center">
                    <FaTrophy size={24} className="mb-1 text-primary" />
                    <div className="text-muted">Hackathon Winner</div>
                  </div>
                  <div className="text-center">
                    <FaTrophy size={24} className="mb-1 text-primary" />
                    <div className="text-muted">Workshop Lead</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="primary" block>Edit Profile</Button>
                <Button variant="outline-secondary" block className="mt-2">Reset Password</Button>
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
                  <span>12/15</span>
                </div>
                <ProgressBar now={80} />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Workshops Completed</span>
                  <span>8/10</span>
                </div>
                <ProgressBar now={80} />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Projects Contributed</span>
                  <span>5/5</span>
                </div>
                <ProgressBar now={100} />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <span>Competitions Participated</span>
                  <span>3/3</span>
                </div>
                <ProgressBar now={100} />
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
                  {[{ event: "Web Development Workshop", date: "Apr 18, 2023", status: "Registered" }, /* other records */].map((record, index) => (
                    <div key={index} className="d-flex justify-content-between mb-3">
                      <div>
                        <strong>{record.event}</strong>
                        <div className="text-muted">
                          <FaCalendarAlt size={14} className="me-1" />
                          {record.date}
                        </div>
                      </div>
                      <Badge variant={record.status === "Attended" ? "primary" : record.status === "Registered" ? "secondary" : "light"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </Card.Body>
                <Card.Footer>
                  <Button variant="outline-secondary" size="sm">View All Records</Button>
                </Card.Footer>
              </Card>
            </Tab>

            <Tab eventKey="projects" title="Projects">
              {/* Similar Project and Notes Sections */}
            </Tab>

            <Tab eventKey="notes" title="Admin Notes">
              {/* Admin Notes Section */}
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

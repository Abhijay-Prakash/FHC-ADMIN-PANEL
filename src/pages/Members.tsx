import axios from "../axiosConfig";
import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Dropdown, DropdownButton, InputGroup, FormControl, Image, Row, Col } from "react-bootstrap";
import { ThreeDotsVertical, EnvelopeFill, CalendarEventFill } from "react-bootstrap-icons";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePic: string;
  createdAt: string;
  semester: string;
  class: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const response = await axios.get("/users/members", { withCredentials: true });
        setMembers(response.data);
        setFilteredMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  const filterMembers = (role: string) => {
    if (role === "all") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter((member) => member.role === role));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="members-container">
      <h1 className="title">Member Management</h1>

      {/* Filter Buttons */}
      <div className="filter-buttons mb-4 d-flex gap-2">
        <Button variant="outline-primary" onClick={() => filterMembers("all")}>All Members</Button>
        <Button variant="outline-success" onClick={() => filterMembers("execom")}>Execom</Button>
        <Button variant="outline-danger" onClick={() => filterMembers("admin")}>Admin</Button>
      </div>

      {/* Cards Grid */}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filteredMembers.map((member) => (
          <Col key={member._id}>
            <Card className="h-100 shadow-sm position-relative">
              {/* Action Menu */}
              <Dropdown className="position-absolute top-0 end-0 m-2">
                <Dropdown.Toggle variant="light" size="sm" className="border-0">
                  <ThreeDotsVertical />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#">View</Dropdown.Item>
                  <Dropdown.Item href="#">Edit</Dropdown.Item>
                  <Dropdown.Item href="#">Deactivate</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Profile */}
              <Card.Body className="text-center">
                <Image src={member.profilePic} roundedCircle width={80} height={80} className="mb-3" />
                <Card.Title className="mb-0">{member.name}</Card.Title>
                <Badge bg={member.role === "admin" ? "danger" : member.role === "execom" ? "success" : "secondary"} className="mb-2">
                  {member.role}
                </Badge>

                {/* Semester and Class */}
                <div className="text-muted mb-2">
                  {`S${member.semester} ${member.class}`}
                </div>

                {/* Email */}
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted mb-1">
                  <EnvelopeFill size={16} className="text-primary" />
                  <small>{member.email}</small>
                </div>

                {/* Joined Date */}
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                  <CalendarEventFill size={16} className="text-success" />
                  <small>{new Date(member.createdAt).toLocaleDateString()}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

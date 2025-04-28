import axios from "../axiosConfig";
import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Dropdown, DropdownButton, InputGroup, FormControl, Image } from "react-bootstrap";

// TypeScript interface to define the member structure
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
      <div className="filter-buttons">
        <Button variant="outline-primary" onClick={() => filterMembers("all")}>All Members</Button>
        <Button variant="outline-success" onClick={() => filterMembers("execom")}>Execom</Button>
        <Button variant="outline-danger" onClick={() => filterMembers("admin")}>Admin</Button>
      </div>

      {/* Search Input */}
      <div className="search-input">
        <InputGroup>
          <InputGroup.Text id="search-addon" className="bg-info text-white">🔍</InputGroup.Text>
          <FormControl
            placeholder="Search members..."
            aria-label="Search members"
            aria-describedby="search-addon"
          />
        </InputGroup>
      </div>

      <div className="actions">
        <Button variant="outline-secondary">Export</Button>
        <Button variant="primary">Add Member</Button>
      </div>

      {/* Members List */}
      <Card className="members-card">
        <Card.Header>
          <h5>Members</h5>
          <DropdownButton variant="outline-light" id="sort-dropdown" title="Sort by">
            <Dropdown.Item href="#">Name (A-Z)</Dropdown.Item>
            <Dropdown.Item href="#">Name (Z-A)</Dropdown.Item>
            <Dropdown.Item href="#">Newest First</Dropdown.Item>
          </DropdownButton>
        </Card.Header>

        <Card.Body>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="member-info">
                        <Image src={member.profilePic} alt={member.name} roundedCircle width={50} height={50} />
                        <div>
                          <strong>{member.name}</strong>
                          <br />
                          <small>{member.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{member.email}</div>
                      <small>Joined: {new Date(member.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <Badge pill variant={member.role === "admin" ? "danger" : member.role === "execom" ? "success" : "secondary"}>
                        {member.role}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="info" size="sm">View</Button>
                      <Button variant="warning" size="sm">Edit</Button>
                      <Button variant="danger" size="sm">Deactivate</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

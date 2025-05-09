import { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import axios from "../axiosConfig";

interface Achievement {
  title: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePic?: string;
  role: string;
  class?: string;
  semester?: number;
  createdAt?: string;
  membershipId?: string;
  githubLink?: string;
  linkedinLink?: string;
  skills?: string[];
  achievements?: Achievement[];
  eventsRegistered?: string[];
  eventsAttended?: string[];
  workshopsCompleted?: string[];
  projectsContributed?: string[];
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<User>(`/users/profile`, {
          withCredentials: true,
        });
        setUser(response.data);

        if (
          response.data.eventsRegistered?.length ||
          response.data.eventsAttended?.length
        ) {
          await axios.get(`/events/user/${id}`);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" as={Link as any} to="/admin/members">
          Back to Members
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <Alert variant="warning">User not found.</Alert>
        <Button variant="primary" as={Link as any} to="/admin/members">
          Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3">
        <Button variant="outline-secondary" size="sm" as={Link as any} to="/admin/members">
          <FaArrowLeft className="me-2" />
          Back
        </Button>
        <div>
          <h1 className="h3">Member Profile</h1>
          <p className="text-muted mb-0">{user.name}</p>
        </div>
      </div>

      {/* Additional user detail rendering can go here */}

      <div className="text-end mt-4">
        <Button variant="primary" className="w-100" as={Link as any} to={`/admin/members/edit/${user._id}`}>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}

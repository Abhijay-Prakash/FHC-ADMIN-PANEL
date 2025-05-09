import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";
import {
  FaMailBulk,
  FaPhoneAlt,
  FaMapPin,
  FaTrophy,
  FaArrowLeft,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
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

interface Metric {
  count: number;
  total: number;
  percentage: number;
}

interface Metrics {
  eventsAttended: Metric;
  workshopsCompleted: Metric;
  projectsContributed: Metric;
  competitionsParticipated: Metric;
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
          // You might want to store the result in `events`, but it’s not being used
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

  const calculateMetrics = (): Metrics | null => {
    if (!user) return null;

    const eventsAttendedCount = user.eventsAttended?.length || 0;
    const eventsRegisteredCount = user.eventsRegistered?.length || 0;
    const workshopsCompleted = user.workshopsCompleted?.length || 0;
    const workshopsTotal = 10;
    const projectsContributed = user.projectsContributed?.length || 0;
    const projectsTotal = 5;
    const competitionsParticipated = 3;
    const competitionsTotal = 3;

    return {
      eventsAttended: {
        count: eventsAttendedCount,
        total:
          eventsRegisteredCount > 0
            ? eventsRegisteredCount
            : eventsAttendedCount + 3,
        percentage:
          eventsRegisteredCount > 0
            ? (eventsAttendedCount / eventsRegisteredCount) * 100
            : 100,
      },
      workshopsCompleted: {
        count: workshopsCompleted,
        total: workshopsTotal,
        percentage: (workshopsCompleted / workshopsTotal) * 100,
      },
      projectsContributed: {
        count: projectsContributed,
        total: projectsTotal,
        percentage: (projectsContributed / projectsTotal) * 100,
      },
      competitionsParticipated: {
        count: competitionsParticipated,
        total: competitionsTotal,
        percentage: (competitionsParticipated / competitionsTotal) * 100,
      },
    };
  };

  const renderDepartment = (): string => {
    if (!user?.class || !user?.semester) return "N/A";
    const classMap: Record<string, string> = {
      CSA: "Computer Science A",
      CSB: "Computer Science B",
      CSC: "Computer Science C",
      CSD: "Computer Science D",
      EC: "Electronics & Communication",
      EI: "Electronics & Instrumentation",
      EE: "Electrical Engineering",
      ME: "Mechanical Engineering",
      CE: "Civil Engineering",
    };
    return `${classMap[user.class] || user.class}, Semester ${user.semester}`;
  };

  const getMemberSinceDate = (): string => {
    if (!user?.createdAt) return "N/A";
    const date = new Date(user.createdAt);
    return `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "admin":
        return "danger";
      case "execom":
        return "primary";
      case "member":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      execom: "Executive Committee",
      member: "Club Member",
      participant: "Participant",
    };
    return roleMap[role] || role;
  };

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
        <Button variant="primary" as={Link} to="/admin/members">
          Back to Members
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-4">
        <Alert variant="warning">User not found.</Alert>
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
                <Button variant="primary" className="w-100" as={Link} to={`/admin/members/edit/${user._id}`}>
                  Edit Profile
                </Button>
                <Button variant="outline-secondary" className="w-100 mt-2">
                  Reset Password
                </Button>
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
              {metrics &&
                Object.entries(metrics).map(([key, value], index) => (
                  <div className="mb-4" key={index}>
                    <div className="d-flex justify-content-between">
                      <span className="text-capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span>
                        {value.count}/{value.total}
                      </span>
                    </div>
                    <ProgressBar
                      now={value.percentage}
                      label={`${Math.round(value.percentage)}%`}
                    />
                  </div>
                ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

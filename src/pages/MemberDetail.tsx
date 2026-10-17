import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "../axiosConfig";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  role: string;
  class?: string;
  semester?: number;
  createdAt?: string;
  membershipId?: string;
}

type ProfileForm = Pick<User, "name" | "email" | "phone" | "class" | "semester">;

export default function MemberDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: "", email: "", phone: "", class: "", semester: undefined });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    axios.get<User>("/users/profile", { withCredentials: true })
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", class: data.class || "", semester: data.semester });
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        if (active) setError(err.response?.data?.message || "Failed to load your profile. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await axios.patch<User>(`/users/${user._id}/profile`, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone?.trim(),
        class: form.class?.trim(), semester: form.semester === undefined || form.semester === "" ? undefined : Number(form.semester),
      });
      setUser((current) => current ? { ...current, ...data } : data);
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", class: data.class || "", semester: data.semester });
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update your profile. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}><Spinner animation="border" role="status"><span className="visually-hidden">Loading profile...</span></Spinner></div>;

  if (!user) return <div className="container py-4"><Alert variant="danger">{error || "Your profile could not be found."}</Alert><Button variant="primary" as={Link as any} to="/admin/dashboard"><FaArrowLeft className="me-2" />Back to dashboard</Button></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" as={Link as any} to="/admin/dashboard"><FaArrowLeft className="me-2" />Back</Button>
        <div><h1 className="h3 mb-1">Admin profile</h1><p className="text-muted mb-0">View and update your account details.</p></div>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            {user.profilePic ? <img src={user.profilePic} alt="Profile" className="rounded-circle" style={{ width: 68, height: 68, objectFit: "cover" }} /> : <FaUserCircle size={68} className="text-secondary" />}
            <div><h2 className="h4 mb-1">{user.name}</h2><div className="text-muted">{user.role}</div></div>
            {!editing && <Button className="ms-auto" onClick={() => { setError(null); setSuccess(null); setEditing(true); }}>Edit profile</Button>}
          </div>
          {editing ? (
            <Form onSubmit={saveProfile}>
              <Row>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Contact number</Form.Label><Form.Control value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Class</Form.Label><Form.Select value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })}><option value="">Select a class</option>{["CSA", "CSB", "CSC", "CSD", "EC", "EI", "EE", "ME", "CE", "IMCA"].map((className) => <option key={className} value={className}>{className}</option>)}</Form.Select></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Current semester</Form.Label><Form.Control type="number" min="1" max="8" value={form.semester ?? ""} onChange={(e) => setForm({ ...form, semester: e.target.value === "" ? undefined : Number(e.target.value) })} /></Form.Group></Col>
              </Row>
              <div className="d-flex justify-content-end gap-2"><Button type="button" variant="outline-secondary" disabled={saving} onClick={() => { setEditing(false); setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", class: user.class || "", semester: user.semester }); }}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? <><Spinner size="sm" className="me-2" />Saving...</> : "Save changes"}</Button></div>
            </Form>
          ) : (
            <Row className="g-3">
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="Contact number" value={user.phone} />
              <ProfileField label="Class" value={user.class} />
              <ProfileField label="Current semester" value={user.semester ? `Semester ${user.semester}` : undefined} />
              <ProfileField label="Membership ID" value={user.membershipId} />
              <ProfileField label="Role" value={user.role} />
              <ProfileField label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : undefined} />
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string }) {
  return <Col md={6}><div className="rounded border p-3 h-100"><div className="small text-muted mb-1">{label}</div><div className="fw-medium">{value || "Not provided"}</div></div></Col>;
}

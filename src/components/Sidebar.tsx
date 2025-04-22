import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Offcanvas, Button, Nav } from "react-bootstrap";
import {
  User,
  LayoutDashboard,
  Calendar,
  BookOpen,
  FolderKanban,
  Trophy,
  Users,
  Menu,
  Code,
  Binary,
  BrainCircuit,
  Cpu,
} from "lucide-react";

const navItems = [
  { name: "Profile", href: "/profile", icon: <User size={18} /> },
  { name: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { name: "BYTE", href: "/byte-register", icon: <Cpu size={18} /> },
  { name: "Events", href: "/events", icon: <Calendar size={18} /> },
  { name: "Workshops", href: "/workshops", icon: <BookOpen size={18} /> },
  { name: "Projects", href: "/projects", icon: <FolderKanban size={18} /> },
  { name: "Competitions", href: "/competitions", icon: <Trophy size={18} /> },
  { name: "Community", href: "/community", icon: <Users size={18} /> },
];

export default function Sidebar() {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setShow(!show);

  const NavLinks = () =>
    navItems.map((item) => (
      <Nav.Item key={item.href} className="mb-2">
        <Link
          to={item.href}
          className={`d-flex align-items-center gap-2 nav-link ${
            location.pathname === item.href ? "fw-bold text-primary" : ""
          }`}
          onClick={() => setShow(false)}
        >
          {item.icon}
          {item.name}
        </Link>
      </Nav.Item>
    ));

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline-secondary"
        className="d-md-none position-fixed top-0 start-0 m-3 z-3"
        onClick={toggleSidebar}
        style={{ zIndex: 1041 }} // Above Offcanvas backdrop
      >
        <Menu size={20} />
      </Button>

      {/* Offcanvas Sidebar for Mobile */}
      <Offcanvas show={show} onHide={toggleSidebar} responsive="md">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>FHC Tech Club</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">{NavLinks()}</Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Static Sidebar for Desktop */}
      <div
        className="d-none d-md-block border-end bg-light p-3"
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1040,
        }}
      >
        <h5 className="mb-4">FHC Tech Club</h5>
        <Nav className="flex-column">{NavLinks()}</Nav>
      </div>
    </>
  );
}

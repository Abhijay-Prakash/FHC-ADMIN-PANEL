  import { useState } from "react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { Offcanvas, Nav } from "react-bootstrap";
  import { Menu, User, LayoutDashboard, Calendar, Cpu, Users, Sparkles, FolderGit2, GraduationCap, LogOut } from "lucide-react";
  import { clearAdminSession } from "../adminSession";
  

  const navItems = [
    { name: "Profile", href: "/admin/profile", icon: <User size={20} /> },
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "BYTE", href: "/admin/byte", icon: <Cpu size={20} /> },
    { name: "Events", href: "/admin/events", icon: <Calendar size={20} /> },
    { name: "Members", href: "/admin/members", icon: <Users size={20} /> },
    { name: "Alumni", href: "/admin/alumni", icon: <GraduationCap size={20} /> },
    { name: "Certificates", href: "/admin/certificates", icon: <Sparkles size={20} /> },
    { name: "Projects", href: "/admin/projects", icon: <FolderGit2 size={20} /> },
  ];

  export default function Sidebar() {
    const [show, setShow] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
      clearAdminSession();
      setShow(false);
      navigate("/admin/login", { replace: true });
    };

    return (
      <>
        {/* Mobile Toggle */}
        <button
          className="d-md-none position-fixed top-0 start-0 m-3 btn btn-outline-light rounded-pill shadow-lg z-3"
          onClick={() => setShow(true)}
          style={{ zIndex: 1050 }}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Offcanvas */}
        <Offcanvas show={show} onHide={() => setShow(false)} className="bg-dark bg-opacity-95">
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="text-gradient fw-bold">FHC Tech Club</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setShow(false)}
                  className={`d-flex align-items-center gap-3 px-4 py-3 rounded-3 text-white text-decoration-none sidebar-glow transition-all ${
                    location.pathname === item.href ? "bg-primary bg-opacity-20 fw-bold" : "opacity-80"
                  }`}
                >
                  <span className="text-cyan">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="d-flex align-items-center gap-3 px-4 py-3 rounded-3 text-white-50 border-0 bg-transparent text-start sidebar-glow">
                <LogOut size={20} />
                <span>Log out</span>
              </button>
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Desktop Sidebar */}
        <div
          className="d-none d-md-block position-fixed top-0 start-0 h-100 glass p-4"
          style={{ width: "180px", zIndex: 1040 }}
        >
          <div className="text-center mb-5">
            <h4 className="text-gradient fw-bold">FHC Tech</h4>
            <small className="text-cyan opacity-75">Admin Portal</small>
          </div>

          <Nav className="flex-column gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`d-flex align-items-center gap-3 px-4 py-3 rounded-3 text-white text-decoration-none sidebar-glow transition-all ${
                  location.pathname === item.href
                    ? "bg-primary bg-opacity-30 fw-bold border-start border-primary border-4"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-cyan">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="d-flex align-items-center gap-3 px-4 py-3 rounded-3 text-white-50 border-0 bg-transparent text-start sidebar-glow">
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </Nav>
        </div>
      </>
    );
  }

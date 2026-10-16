// src/pages/ProjectsPage.tsx
import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  User,
  Tag,
  Clock,
} from "lucide-react";

interface UserType {
  _id: string;
  name: string;
  email: string;
  class?: string;
  semester?: string;
}

interface ProjectType {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  owner: UserType;
  teamMembers: UserType[];
  tags: string[];
  repoLink?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}


const skillColors: Record<string, string> = {
  React: "#61dafb",
  Nodejs: "#339933",
  Python: "#3776ab",
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  MongoDB: "#47a248",
  Firebase: "#ffca28",
  Docker: "#2496ed",
  AWS: "#ff9900",
  Flutter: "#02569b",
  TensorFlow: "#ff6f00",
  Nextjs: "#000000",
  Tailwind: "#06b6d4",
  Default: "#8b5cf6",
};


const ProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("pending");
  const [approvedProjects, setApprovedProjects] = useState<ProjectType[]>([]);
  const [pendingProjects, setPendingProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionModal, setActionModal] = useState<{
    show: boolean;
    project?: ProjectType;
    action: "approve" | "reject";
  }>({
    show: false,
    action: "approve",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        axios.get<ProjectType[]>("/projects/admin/all", { withCredentials: true }),
        axios.get<ProjectType[]>("/projects/admin/pending", { withCredentials: true }),
      ]);

      setApprovedProjects(approvedRes.data.filter((p) => p.status === "approved"));
      setPendingProjects(pendingRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load projects");
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  const handleApprove = async (projectId: string) => {
    try {
      await axios.put(`/projects/admin/approve/${projectId}`, {}, { withCredentials: true });
      setPendingProjects((prev) => prev.filter((p) => p._id !== projectId));
      fetchProjects(); // refresh approved list
      setActionModal({ show: false, action: "approve" });
    } catch {
      alert("Failed to approve project");
    }
  };

  const handleReject = async (projectId: string) => {
    try {
      await axios.put(`/projects/admin/reject/${projectId}`, {}, { withCredentials: true });
      setPendingProjects((prev) => prev.filter((p) => p._id !== projectId));
      setActionModal({ show: false, action: "approve" });
    } catch {
      alert("Failed to reject project");
    }
  };

  const openActionModal = (project: ProjectType, action: "approve" | "reject") => {
    setActionModal({ show: true, project, action });
  };

  const closeModal = () => setActionModal({ show: false, action: "approve" });

  const projectsToShow = activeTab === "pending" ? pendingProjects : approvedProjects;

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-cyan" style={{ width: "4.5rem", height: "4.5rem" }} />
          <p className="mt-4 fs-4 text-white opacity-75">Loading Projects...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div
        className="min-vh-100"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
      >
        <div className="container-fluid px-4 py-5">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-gradient mb-3">Projects Management</h1>
            <p className="lead text-white opacity-80">Review and manage student project submissions</p>
          </div>

          {/* Tabs */}
          <div className="d-flex justify-content-center mb-5 gap-4">
            <button
              onClick={() => setActiveTab("pending")}
              className={`category-filter-btn ${activeTab === "pending" ? "active" : ""}`}
              style={{ minWidth: "180px" }}
            >
              Pending Requests ({pendingProjects.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`category-filter-btn ${activeTab === "approved" ? "active" : ""}`}
              style={{ minWidth: "180px" }}
            >
              Approved Projects ({approvedProjects.length})
            </button>
          </div>

          {/* Grid */}
          <div className="row g-4">
            {projectsToShow.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-white opacity-60 fs-4">
                  {activeTab === "pending" ? "No pending project requests" : "No approved projects yet"}
                </p>
              </div>
            ) : (
              projectsToShow.map((project, idx) => {
                const skillColor = skillColors[project.requiredSkills[0]] || skillColors.Default;

                return (
                  <div key={project._id} className="col-12 col-md-6 col-xl-4">
                    <div
                      className="event-card h-100"
                      style={{
                        animation: `fadeUp 0.6s ease-out forwards`,
                        animationDelay: `${idx * 0.1}s`,
                        opacity: 0,
                      }}
                    >
                      {/* Header */}
                      <div
                        className="event-card-header"
                        style={{
                          background: `linear-gradient(135deg, ${skillColor}22 0%, ${skillColor}11 100%)`,
                          borderBottom: `2px solid ${skillColor}66`,
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <h3 className="event-title text-white mb-0">{project.title}</h3>
                          <span
                            className="category-badge"
                            style={{
                              background: skillColor,
                              boxShadow: `0 4px 15px ${skillColor}66`,
                              fontSize: "11px",
                            }}
                          >
                            {activeTab === "pending" ? "PENDING" : "APPROVED"}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="event-card-body">
                        <p className="event-description text-white-50">{project.description}</p>

                        <div className="d-flex align-items-center gap-3 mb-3">
                          <User size={18} className="text-cyan" />
                          <div>
                            <div className="text-white fw-semibold">{project.owner.name}</div>
                            <div className="text-white-50 small">{project.owner.email}</div>
                          </div>
                        </div>

                        <div className="event-tags mb-3">
                          {project.requiredSkills.map((skill) => (
                            <span
                              key={skill}
                              className="event-tag"
                              style={{
                                background: `${skillColors[skill] || skillColors.Default}22`,
                                borderColor: `${skillColors[skill] || skillColors.Default}55`,
                                color: skillColors[skill] || skillColors.Default,
                              }}
                            >
                              <Tag size={12} /> {skill}
                            </span>
                          ))}
                        </div>

                        {project.tags?.length > 0 && (
                          <div className="event-tags mb-3">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="event-tag"
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  borderColor: "rgba(255,255,255,0.3)",
                                  color: "#fff",
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {project.repoLink && (
                          <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-inline-flex align-items-center gap-2 text-cyan small mb-3"
                          >
                            <ExternalLink size={16} /> View Repository
                          </a>
                        )}

                        <div className="text-white-50 small d-flex align-items-center gap-2">
                          <Clock size={14} /> Submitted {formatDate(project.createdAt)}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="event-card-footer">
                        {activeTab === "pending" ? (
                          <>
                            <button
                              onClick={() => openActionModal(project, "approve")}
                              className="action-btn view-btn flex-fill"
                              style={{
                                background: "rgba(34,197,94,0.2)",
                                borderColor: "rgba(34,197,94,0.5)",
                                color: "#22c55e",
                              }}
                            >
                              <CheckCircle size={18} /> Approve
                            </button>
                            <button
                              onClick={() => openActionModal(project, "reject")}
                              className="action-btn delete-btn"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        ) : (
                          <div className="w-100 text-center text-success fw-bold">Approved</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {actionModal.show && actionModal.project && (
          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.95)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-card border-0 rounded-4">
                <div
                  className={`modal-header border-0 text-${
                    actionModal.action === "approve" ? "success" : "danger"
                  }`}
                >
                  <h4 className="fw-bold d-flex align-items-center gap-3">
                    {actionModal.action === "approve" ? <CheckCircle size={28} /> : <XCircle size={28} />}
                    Confirm {actionModal.action === "approve" ? "Approval" : "Rejection"}
                  </h4>
                  <button className="btn-close btn-close-white" onClick={closeModal} />
                </div>
                <div className="modal-body text-center py-5 text-white">
                  <h5>{actionModal.project.title}</h5>
                  <p className="opacity-80">
                    Are you sure you want to <strong>{actionModal.action}</strong> this project?
                  </p>
                </div>
                <div className="modal-footer border-0 justify-content-center gap-4 pb-5">
                  <button className="btn btn-outline-light px-6" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className={`btn px-7 fw-bold ${
                      actionModal.action === "approve" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() =>
                      actionModal.action === "approve"
                        ? handleApprove(actionModal.project!._id)
                        : handleReject(actionModal.project!._id)
                    }
                  >
                    Yes, {actionModal.action === "approve" ? "Approve" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .category-filter-btn {
          padding: 14px 32px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid rgba(0,212,255,0.4);
          background: rgba(15,12,41,0.85);
          color: #fff;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .category-filter-btn:hover {
          border-color: rgba(0,212,255,0.8);
          background: rgba(0,212,255,0.15);
          transform: translateY(-3px);
        }
        .category-filter-btn.active {
          background: linear-gradient(135deg, #00d4ff 0%, #ff6bcb 100%);
          border-color: transparent;
          color: #000;
          font-weight: 700;
          box-shadow: 0 8px 30px rgba(0,212,255,0.6);
        }
        .event-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .event-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0,212,255,0.3);
          border-color: rgba(0,212,255,0.5);
        }
        .event-card-header, .event-card-body, .event-card-footer {
          padding: 24px;
        }
        .event-title { font-size: 21px; font-weight: 700; }
        .category-badge { padding: 8px 16px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
        .event-description { font-size: 15px; line-height: 1.6; min-height: 70px; }
        .event-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .event-tag { padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: 600; border: 1px solid; display: inline-flex; align-items: center; gap: 5px; }
        .action-btn { padding: 10px 16px; border-radius: 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: #fff; transition: all 0.3s; }
        .action-btn:hover { background: rgba(255,255,255,0.15); }
        .glass-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); }
        .text-gradient { background: linear-gradient(90deg, #00d4ff, #ff6bcb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-cyan { color: #00d4ff; }
      `}</style>
    </>
  );
};

export default ProjectsPage;
import { useEffect, useState } from "react";
import api from "../services/api";
import "./UserDashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
    const [domains, setDomains] = useState([]);
    const [domainName, setDomainName] = useState("");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingDomainId, setEditingDomainId] = useState(null);
    const [editingDomainName, setEditingDomainName] = useState("");
    const [updatingDomainId, setUpdatingDomainId] = useState(null);
    const [deletingDomainId, setDeletingDomainId] = useState(null);

    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    useEffect(() => {
        loadProfile();
        loadDomains();
    }, []);

    async function loadProfile() {
        try {
            const res = await api.get("/auth/me");
            setProfile(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load profile.");
        }
    }

    async function loadDomains() {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/domain/my");
            setDomains(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load domains.");
        } finally {
            setLoading(false);
        }
    }

    async function createDomain() {
        if (!domainName.trim()) return;
        setAdding(true);
        setError("");
        setSuccessMessage("");
        try {
            await api.post("/domain", { domainName });
            setDomainName("");
            await loadDomains();
            setSuccessMessage("Domain added successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add domain.");
        } finally {
            setAdding(false);
        }
    }

    async function handleEditDomain(domain) {
        if (editingDomainId === domain._id) {
            setUpdatingDomainId(domain._id);
            setError("");
            setSuccessMessage("");
            try {
                await api.put(`/domain/${domain._id}`, { domainName: editingDomainName.trim() });
                setEditingDomainId(null);
                setEditingDomainName("");
                await loadDomains();
                setSuccessMessage("Domain updated successfully.");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to update domain.");
            } finally {
                setUpdatingDomainId(null);
            }
            return;
        }

        setEditingDomainId(domain._id);
        setEditingDomainName(domain.domainName);
    }

    async function handleDeleteDomain(domainId) {
        if (!window.confirm("Delete this domain?")) return;
        setDeletingDomainId(domainId);
        setError("");
        setSuccessMessage("");
        try {
            await api.delete(`/domain/${domainId}`);
            await loadDomains();
            setSuccessMessage("Domain deleted successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete domain.");
        } finally {
            setDeletingDomainId(null);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            createDomain();
        }
    }

    return (
        <div className="user-dashboard-page">
            <div className="user-dashboard-card">
                <div className="card-header">
                    <h2>My Dashboard</h2>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>

                {error && <div className="dashboard-error">{error}</div>}
                {successMessage && <div className="dashboard-success">{successMessage}</div>}

                <div className="profile-card">
                    <h3>Profile</h3>
                    {profile ? (
                        <div className="profile-details">
                            <p><strong>Name:</strong> {profile.name}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Role:</strong> {profile.role}</p>
                        </div>
                    ) : (
                        <p className="dashboard-loading">Loading profile...</p>
                    )}
                </div>

                <div className="add-domain-row">
                    <input
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="google.com"
                    />
                    <button onClick={createDomain} disabled={adding}>
                        {adding ? "Adding..." : "Add Domain"}
                    </button>
                </div>

                <div className="domain-list">
                    {loading ? (
                        <p className="dashboard-loading">Loading domains...</p>
                    ) : domains.length === 0 ? (
                        <p className="no-data">No domains added yet.</p>
                    ) : (
                        domains.map(domain => (
                            <div key={domain._id} className="domain-item">
                                <span className="domain-icon">🌐</span>
                                {editingDomainId === domain._id ? (
                                    <div className="edit-domain-row">
                                        <input
                                            value={editingDomainName}
                                            onChange={(e) => setEditingDomainName(e.target.value)}
                                        />
                                        <button className="action-btn" onClick={() => handleEditDomain(domain)} disabled={updatingDomainId === domain._id}>
                                            {updatingDomainId === domain._id ? "Saving..." : "Save"}
                                        </button>
                                        <button className="action-btn secondary" onClick={() => { setEditingDomainId(null); setEditingDomainName(""); }}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="domain-name">{domain.domainName}</span>
                                        <div className="domain-actions">
                                            <button className="action-btn" onClick={() => handleEditDomain(domain)}>Edit</button>
                                            <button className="action-btn delete" onClick={() => handleDeleteDomain(domain._id)} disabled={deletingDomainId === domain._id}>
                                                {deletingDomainId === domain._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

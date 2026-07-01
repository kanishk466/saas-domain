import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [assigningId, setAssigningId] = useState(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "user" });
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingUserForm, setEditingUserForm] = useState({ name: "", email: "", role: "user" });
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        setLoading(true);
        setError("");
        try {
            await Promise.all([loadUsers(), loadDomains()]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }

    async function loadUsers() {
        const res = await api.get("/admin/users");
        setUsers(res.data);
    }

    async function loadDomains() {
        const res = await api.get("/domain");
        setDomains(res.data);
    }

    async function assignDomain(domainId, userId) {
        setAssigningId(userId);
        setError("");
        try {
            await api.put(`/domain/assign/${domainId}`, { userId });
            await Promise.all([loadUsers(), loadDomains()]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign domain.");
        } finally {
            setAssigningId(null);
        }
    }

    async function handleCreateUser(e) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setCreatingUser(true);

        try {
            await api.post("/admin/users", createForm);
            setSuccessMessage("User created successfully.");
            setCreateForm({ name: "", email: "", password: "", role: "user" });
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create user.");
        } finally {
            setCreatingUser(false);
        }
    }

    async function handleEditUser(user) {
        if (editingUserId === user._id) {
            setUpdatingUserId(user._id);
            setError("");
            setSuccessMessage("");
            try {
                await api.put(`/admin/users/${user._id}`, editingUserForm);
                setEditingUserId(null);
                setEditingUserForm({ name: "", email: "", role: "user" });
                await loadUsers();
                setSuccessMessage("User updated successfully.");
            } catch (err) {
                setError(err.response?.data?.message || "Failed to update user.");
            } finally {
                setUpdatingUserId(null);
            }
            return;
        }

        setEditingUserId(user._id);
        setEditingUserForm({ name: user.name, email: user.email, role: user.role || "user" });
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm("Delete this user?")) return;
        setDeletingUserId(userId);
        setError("");
        setSuccessMessage("");
        try {
            await api.delete(`/admin/users/${userId}`);
            await loadUsers();
            setSuccessMessage("User deleted successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user.");
        } finally {
            setDeletingUserId(null);
        }
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <div className="header-actions">
                    <span className="user-count">{users.length} users</span>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {error && <div className="dashboard-error">{error}</div>}
            {successMessage && <div className="dashboard-success">{successMessage}</div>}

            <div className="create-user-card">
                <h3>Create New User</h3>
                <form className="create-user-form" onSubmit={handleCreateUser}>
                    <div className="form-grid">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            required
                        />
                        <select
                            name="role"
                            value={createForm.role}
                            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button className="create-user-submit" type="submit" disabled={creatingUser}>
                        {creatingUser ? "Creating..." : "Create User"}
                    </button>
                </form>
            </div>

            {loading ? (
                <p className="dashboard-loading">Loading data...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Domains</th>
                                <th>Assign</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            {editingUserId === user._id ? (
                                                <input
                                                    className="inline-edit-input"
                                                    value={editingUserForm.name}
                                                    onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                                                />
                                            ) : (
                                                user.name
                                            )}
                                        </td>
                                        <td>
                                            {editingUserId === user._id ? (
                                                <input
                                                    className="inline-edit-input"
                                                    value={editingUserForm.email}
                                                    onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </td>
                                        <td>
                                            {user.domains.length === 0 ? (
                                                <span className="no-domain">—</span>
                                            ) : (
                                                <div className="domain-tags">
                                                    {user.domains.map(d => (
                                                        <span key={d._id} className="domain-tag">
                                                            {d.domainName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                className="assign-select"
                                                disabled={assigningId === user._id}
                                                defaultValue=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        assignDomain(e.target.value, user._id);
                                                        e.target.value = "";
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>
                                                    {assigningId === user._id ? "Assigning..." : "Select Domain"}
                                                </option>
                                                {domains.map(domain => (
                                                    <option key={domain._id} value={domain._id}>
                                                        {domain.domainName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            {editingUserId === user._id ? (
                                                <div className="table-actions">
                                                    <select
                                                        className="inline-edit-select"
                                                        value={editingUserForm.role}
                                                        onChange={(e) => setEditingUserForm({ ...editingUserForm, role: e.target.value })}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button className="action-btn" onClick={() => handleEditUser(user)} disabled={updatingUserId === user._id}>
                                                        {updatingUserId === user._id ? "Saving..." : "Save"}
                                                    </button>
                                                    <button className="action-btn secondary" onClick={() => { setEditingUserId(null); setEditingUserForm({ name: "", email: "", role: "user" }); }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="table-actions">
                                                    <button className="action-btn" onClick={() => handleEditUser(user)}>Edit</button>
                                                    <button className="action-btn delete" onClick={() => handleDeleteUser(user._id)} disabled={deletingUserId === user._id}>
                                                        {deletingUserId === user._id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
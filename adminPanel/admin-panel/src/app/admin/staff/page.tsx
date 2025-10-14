"use client";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Mail,
  Shield,
  Key,
  Trash2,
  Edit,
  Plus,
  X,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  notifications?: boolean;
}

export default function Staff() {
  const { data, mutate } = useSWR("/staff", fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    visible: boolean;
  }>({
    message: '',
    type: 'success',
    visible: false
  });

  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "admin" });
    setEditingUser(null);
  };

  // Function to decode JWT token and get user role
  const getUserRoleFromToken = () => {
    if (typeof window === "undefined") return { role: "", name: "" };
    try {
      let token = localStorage.getItem("token");

      // Fallback: check cookie if no token in localStorage
      if (!token) {
        const cookies = document.cookie
          .split(";")
          .reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key && value) acc[key] = decodeURIComponent(value);
            return acc;
          }, {});
        token = cookies["nxl_jwt"];
      }

      if (!token) return { role: "", name: "" };

      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
      console.log("Token parts:", token.split("."));

      // Try different possible role fields
      const role = payload.role || payload.userRole || payload.user?.role || "";
      const name = payload.name || payload.userName || payload.user?.name || "";

      console.log("Extracted role:", role);
      console.log("Extracted name:", name);

      return { role, name };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { role: "", name: "" };
    }
  };

  // Check authorization on component mount
  useEffect(() => {
    const checkAuthorization = () => {
      const { role } = getUserRoleFromToken();
      setIsAuthorized(role === "superadmin" || role === "dev");
      setIsLoading(false);
    };

    checkAuthorization();
  }, []);

  const openModal = (user?: StaffMember) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  async function createOrUpdate() {
    if (!formData.name || !formData.email) return;

    try {
      if (editingUser) {
        // Update user
        await api.patch(`/staff/${editingUser._id}`, {
          name: formData.name,
          role: formData.role,
        });
        showToast("Staff member updated successfully", "success");
      } else {
        const response = await api.post("/staff", formData);
        if (response.data.generatedPassword) {
          showToast(`Staff member created successfully! Generated password: ${response.data.generatedPassword}`, "success");
        } else {
          showToast("Staff member created successfully", "success");
        }
      }
      mutate();
      closeModal();
    } catch (error: any) {
      showToast(error.message || "Error saving user", "error");
    }
  }

  async function resetPassword(user: StaffMember) {
    setSelectedUser(user);
    setNewPassword("");
    setShowResetDialog(true);
  }

  async function confirmResetPassword() {
    if (!selectedUser || !newPassword.trim()) return;

    try {
      await api.post(`/staff/${selectedUser._id}/reset-password`, { password: newPassword });
      showToast("Password reset successfully", "success");
      setShowResetDialog(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error: any) {
      showToast(error.message || "Error resetting password", "error");
    }
  }

  async function deleteUser(user: StaffMember) {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  }

  async function confirmDelete() {
    if (!selectedUser) return;

    try {
      await api.delete(`/staff/${selectedUser._id}`);
      showToast("Staff member deleted successfully", "success");
      mutate();
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error: any) {
      showToast(error.message || "Error deleting user", "error");
    }
  }

  async function changeRole(user: StaffMember) {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleDialog(true);
  }

  async function confirmRoleChange() {
    if (!selectedUser || !newRole) return;

    try {
      await api.patch(`/staff/${selectedUser._id}`, { role: newRole });
      showToast("Role updated successfully", "success");
      mutate();
      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole("");
    } catch (error: any) {
      showToast(error.message || "Error updating role", "error");
    }
  }

  async function toggleNotifications(user: StaffMember) {
    try {
      const newState = !user.notifications;
      await api.patch(`/staff/${user._id}/notifications`, { enabled: newState });
      showToast(`Notifications ${newState ? 'enabled' : 'disabled'}`, "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error updating notifications", "error");
    }
  }

  async function sendResetLink(user: StaffMember) {
    try {
      const response = await api.post(`/staff/${user._id}/send-reset-link`, {});
      showToast(`Password reset link sent to ${user.email}`, "success");
    } catch (error: any) {
      showToast(error.response?.data?.error || "Error sending reset link", "error");
    }
  }

  // Function to check if user can be modified by current user
  const canModifyUser = (targetUser: StaffMember) => {
    const { role: currentUserRole, name: currentUserName } = getUserRoleFromToken();
    
    // Check if trying to modify self
    const isSelf = targetUser.name === currentUserName || targetUser.email === localStorage.getItem("userEmail");
    
    // Dev cannot modify their own account
    if (currentUserRole === "dev" && isSelf && targetUser.role === "dev") {
      return false;
    }
    
    // Dev can modify anyone else
    if (currentUserRole === "dev") return true;
    
    // Superadmin cannot modify other superadmins or dev users
    if (currentUserRole === "superadmin") {
      return targetUser.role !== "superadmin" && targetUser.role !== "dev";
    }
    
    // Others cannot modify anyone
    return false;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Access Denied State */}
      {!isLoading && !isAuthorized && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-slate-600 dark:text-slate-400">You need superadmin or dev privileges to access staff management.</p>
          </div>
        </div>
      )}

      {/* Main Content - Only show if authorized */}
      {!isLoading && isAuthorized && (
        <>
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Staff Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your team members and their access levels
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Staff</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.items?.length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.items?.filter((u: StaffMember) => u.role === "admin").length || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Super Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.items?.filter((u: StaffMember) => u.role === "superadmin").length || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Staff Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {(data?.items || []).map((user: StaffMember, index: number) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {user.name || "Unnamed"}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Action Buttons - Two Rows for Better Visibility */}
                <div className="space-y-2">
                  {/* Row 1: Edit, Role, Notifications */}
                  <div className="flex gap-2">
                    {canModifyUser(user) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Edit staff member"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                    )}
                    {canModifyUser(user) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => changeRole(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Change user role"
                      >
                        <Shield className="w-4 h-4" />
                        Role
                      </motion.button>
                    )}
                    {canModifyUser(user) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleNotifications(user)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          user.notifications !== false
                            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                        }`}
                        title="Toggle notifications"
                      >
                        {user.notifications !== false ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Row 2: Send Link, Reset Password, Delete */}
                  {canModifyUser(user) && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendResetLink(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Send password reset link via email"
                      >
                        <Mail className="w-4 h-4" />
                        Send Link
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => resetPassword(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Reset password directly"
                      >
                        <Key className="w-4 h-4" />
                        Reset
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteUser(user)}
                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        title="Delete staff member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {editingUser ? "Edit Staff" : "Add New Staff"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createOrUpdate();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  {!editingUser && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Key className="w-4 h-4" />
                        <span className="text-sm font-medium">Password Generation</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        A secure password will be automatically generated and sent to the staff member's email.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Role
                    </label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {editingUser ? "Update" : "Create"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-6 right-6 z-[9999]"
          >
            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/25'
                : toast.type === 'error'
                ? 'bg-red-500 text-white border-red-400 shadow-red-500/25'
                : 'bg-yellow-500 text-white border-yellow-400 shadow-yellow-500/25'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                className="ml-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Dialog */}
      <AnimatePresence>
        {showResetDialog && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reset Password</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reset password for {selectedUser.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowResetDialog(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmResetPassword}
                  disabled={!newPassword.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Reset Password
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Staff Member</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Are you sure you want to delete <strong>{selectedUser.name}</strong>? This will permanently remove their account and all associated data.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Dialog */}
      <AnimatePresence>
        {showRoleDialog && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRoleDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Role</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Update role for {selectedUser.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Role
                  </label>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {selectedUser.role}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Role
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmRoleChange}
                  disabled={newRole === selectedUser.role}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Update Role
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        </>
      )}
    </div>
  );
}

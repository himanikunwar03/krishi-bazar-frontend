"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    type User, 
    type CreateUserRequest, 
    type UpdateUserRequest 
} from "@/lib/api/admin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        role: "user"
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUsers(page, limit, search || undefined);
            setUsers(response.data.data || []);
            setTotal(response.data.meta.total || 0);
            setTotalPages(response.data.meta.totalPages || 1);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
            setUsers([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUser(formData as CreateUserRequest);
            toast.success("User created successfully");
            setShowCreateModal(false);
            setFormData({ firstName: "", lastName: "", email: "", username: "", password: "", role: "user" });
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            const updateData: UpdateUserRequest = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }
            await updateUser(selectedUser._id, updateData);
            toast.success("User updated successfully");
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({ firstName: "", lastName: "", email: "", username: "", password: "", role: "user" });
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser._id);
            toast.success("User deleted successfully");
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: "",
            role: user.role
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="rounded-lg bg-[#1a4731] px-4 py-2 text-white hover:bg-[#1a4731]/90 transition-colors"
                >
                    + Create User
                </button>
            </div>

            {/* Search Bar */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading users...</div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No users found</p>
                </div>
            )}

            {/* Users Table */}
            {!loading && !error && users.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {user._id.slice(-6)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        {user.username && (
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            user.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : user.role === 'customer'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="mr-2 text-[#1a4731] hover:text-[#1a4731]/80"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(user)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                                <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                                <span className="font-medium">{total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`relative inline-flex items-center border px-3 py-2 text-sm font-medium ${
                                                page === pageNum
                                                    ? "z-10 border-[#1a4731] bg-[#1a4731] text-white"
                                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username (optional)</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#1a4731] px-4 py-2 text-white hover:bg-[#1a4731]/90"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Edit User</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username (optional)</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#1a4731] focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#1a4731] px-4 py-2 text-white hover:bg-[#1a4731]/90"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Delete User</h2>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>
    );
}

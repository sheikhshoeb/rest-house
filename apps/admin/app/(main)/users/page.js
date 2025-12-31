"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import useAdminAuth from "../../../components/useAdminAuth";
import StatCard from "../../../components/StatCard";
import ConfirmDialog from "../../../components/ConfirmDialog";

/* ---------------- MOCK DATA (UI ONLY) ---------------- */

export default function UsersPage() {
  const authStatus = useAdminAuth();

  const [users, setUsers] = useState([]);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    rejected: 0,
    employee: 0,
    guest: 0,
    all: 0,
  });

  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [userSearch, setUserSearch] = useState("");

  const [employeeIds, setEmployeeIds] = useState([]);
  const [empIdTotalPages, setEmpIdTotalPages] = useState(1);
  const [searchEmpId, setSearchEmpId] = useState("");
  const [newEmpId, setNewEmpId] = useState("");

  const [viewUser, setViewUser] = useState(null);
  const [confirmUserOpen, setConfirmUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [confirmEmpIdOpen, setConfirmEmpIdOpen] = useState(false);
  const [empIdToDelete, setEmpIdToDelete] = useState(null);

  const [bulkUploading, setBulkUploading] = useState(false);

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const usersFetchRef = React.useRef(0);

  /* ---------------- PAGINATION ---------------- */
  const USERS_PER_PAGE = 10;
  const EMPIDS_PER_PAGE = 10;

  const [userPage, setUserPage] = useState(1);
  const [empIdPage, setEmpIdPage] = useState(1);

  const [usedEmployeeIds, setUsedEmployeeIds] = useState([]);

  /* USER PAGINATION */

  const totalUserPages = userTotalPages;

  const safeUserPage = Math.max(1, Math.min(userPage, totalUserPages || 1));

  const paginatedUsers = users;

  const fetchUsers = async () => {
    const fetchId = ++usersFetchRef.current;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${safeUserPage}&limit=${USERS_PER_PAGE}&search=${userSearch}&filter=${activeFilter}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch users");

      const json = await res.json();

      // ❗ Ignore outdated responses
      if (fetchId !== usersFetchRef.current) return;

      const normalized = json.data.map((u) => ({
        id: u._id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        role:
          u.role === "employee"
            ? "Employee"
            : u.role === "ex-employee"
            ? "Ex-Employee"
            : u.role === "guest"
            ? "Guest"
            : "Admin",
        status:
          u.status === "pending"
            ? "Pending"
            : u.status === "approved"
            ? "Approved"
            : "Rejected",
        employeeId: u.employeeId || null,
        idCard: u.idCardPath
          ? `${process.env.NEXT_PUBLIC_API_URL}${u.idCardPath}`
          : "/images/id-sample.png",
      }));

      setUsers(normalized);
      setUserTotalPages(json.pagination.totalPages);
      setStats(json.stats);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  // 🔄 Auto-refresh users & stats every 5 seconds
  useEffect(() => {
    if (authStatus !== "authed") return;

    const interval = setInterval(() => {
      fetchUsers();
      fetchUsedEmployeeIds();
      fetchEmployeeIds(); // 🔥 THIS WAS MISSING
    }, 5000);

    return () => clearInterval(interval);
  }, [authStatus, activeFilter, userSearch, userPage, empIdPage, searchEmpId]);

  /* RESET PAGINATION ON FILTER / SEARCH CHANGE */

  useEffect(() => {
    if (authStatus !== "authed") return;
    fetchUsers();
  }, [authStatus, userPage, userSearch, activeFilter]);

  useEffect(() => {
    if (authStatus !== "authed") return;
    fetchUsedEmployeeIds();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authed") return;
    fetchEmployeeIds();
  }, [authStatus, empIdPage, searchEmpId]);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking admin session…
      </div>
    );
  }
  if (authStatus === "unauth") return null;

  /* ---------------- HANDLERS ---------------- */

  const updateUserStatusApi = async (userId, action) => {
    const endpoint =
      action === "Approved"
        ? `/api/admin/guest/${userId}/approve`
        : `/api/admin/guest/${userId}/reject`;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update status");
    }

    return res.json();
  };

  const fetchUsedEmployeeIds = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?filter=EMPLOYEE,EX_EMPLOYEE&limit=10000`,
        { credentials: "include" }
      );

      if (!res.ok) return;

      const json = await res.json();

      setUsedEmployeeIds(json.data.map((u) => u.employeeId).filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch used employee IDs", err);
    }
  };

  const fetchEmployeeIds = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employee-ids?page=${empIdPage}&limit=${EMPIDS_PER_PAGE}&search=${searchEmpId}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch employee IDs");

      const json = await res.json();

      // ✅ store only IDs
      setEmployeeIds(json.data.map((x) => x.employeeId));

      // ✅ store total pages from API
      setEmpIdTotalPages(json.pagination.totalPages);
    } catch (err) {
      console.error("Employee ID fetch failed:", err);
    }
  };

  const createEmployeeId = async (employeeId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employee-ids`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add employee ID");
    }

    return res.json();
  };

  const deleteEmployeeId = async (employeeId) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employee-ids/${employeeId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete employee ID");
    }

    return res.json();
  };

  const updateUserStatus = async (id, status) => {
    try {
      setUpdatingUserId(id);
      await updateUserStatusApi(id, status);
      await fetchUsers();
      fetchUsedEmployeeIds();
      setViewUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDeleteUser = (u) => {
    setUserToDelete(u);
    setConfirmUserOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }

      // 🔥 INSTANT UI UPDATE (THIS IS THE KEY PART)
      if (userToDelete.employeeId) {
        setUsedEmployeeIds((prev) =>
          prev.filter((id) => id !== userToDelete.employeeId)
        );
      }

      setConfirmUserOpen(false);
      setUserToDelete(null);

      // optional but safe
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const addEmployeeId = async () => {
    const id = newEmpId.trim();
    if (!id) return;

    try {
      await createEmployeeId(id);
      setNewEmpId("");
      setEmpIdPage(1);
      fetchEmployeeIds(); // refresh list from DB
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDeleteEmployeeId = (id) => {
    setEmpIdToDelete(id);
    setConfirmEmpIdOpen(true);
  };

  const handleDeleteEmployeeId = async () => {
    if (!empIdToDelete) return;

    try {
      await deleteEmployeeId(empIdToDelete);

      setConfirmEmpIdOpen(false);
      setEmpIdToDelete(null);

      // refresh list from DB (keeps pagination + search correct)
      fetchEmployeeIds();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result || "";

      const ids = text
        .split(/\r?\n|,/)
        .map((id) => id.trim())
        .filter(Boolean);

      if (ids.length === 0) return;

      try {
        for (const id of ids) {
          try {
            await createEmployeeId(id);
          } catch (err) {
            // duplicate or invalid → skip
            console.warn(`Skipped ${id}:`, err.message);
          }
        }

        setEmpIdPage(1);
        fetchEmployeeIds(); // refresh from DB
      } catch (err) {
        alert("Bulk upload failed");
      }
    };

    reader.readAsText(file);
  };

  // ✅ EMPLOYEE ID PAGINATION RANGE HELPER (FINAL FIX)
  const getEmpIdPageRange = (current, total) => {
    const pages = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    // PAGE 1
    if (current === 1) {
      return [1, 2, "…", total];
    }

    // PAGE 2
    if (current === 2) {
      return [1, 2, 3, "…", total];
    }

    // LAST PAGE
    if (current === total) {
      return [1, "…", total - 1, total];
    }

    // SECOND LAST PAGE
    if (current === total - 1) {
      return [1, "…", total - 2, total - 1, total];
    }

    // MIDDLE PAGES (3 to total-2)
    return [1, "…", current - 1, current, current + 1, "…", total];
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className="min-h-screen bg-white text-[14px]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex pt-4 md:pt-8 px-4 md:px-8 gap-8">
        {/* Sidebar unchanged */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 space-y-6">
          {/* ---------- KPI FILTER CARDS ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div
              onClick={() => {
                setActiveFilter("PENDING");
                setUserPage(1); // RESET USER PAGINATION
              }}
              className="cursor-pointer"
            >
              <StatCard title="Pending Requests" value={stats.pending} />
            </div>
            <div
              onClick={() => {
                setActiveFilter("ALL");
                setUserPage(1);
              }}
              className="cursor-pointer"
            >
              <StatCard title="All Users" value={stats.all} />
            </div>
            <div
              onClick={() => {
                setActiveFilter("EMPLOYEE");
                setUserPage(1);
              }}
              className="cursor-pointer"
            >
              <StatCard title="Employees" value={stats.employee} />
            </div>
            <div
              onClick={() => {
                setActiveFilter("GUEST");
                setUserPage(1);
              }}
              className="cursor-pointer"
            >
              <StatCard title="Guests" value={stats.guest} />
            </div>
            <div
              onClick={() => {
                setActiveFilter("REJECTED");
                setUserPage(1);
              }}
              className="cursor-pointer"
            >
              <StatCard title="Rejected" value={stats.rejected} />
            </div>
          </div>

          {/* ---------- USER MANAGEMENT ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#10375C] mb-4">
              User Management
            </h3>

            <div className="mb-4 flex items-center gap-3">
              <input
                placeholder="Search by name, role, employee ID or status"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1); // RESET USER PAGINATION
                }}
                className="w-full md:w-80 border rounded-lg px-4 py-2"
              />
            </div>

            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th>Name</th>
                    <th>Role</th>
                    <th>Employee ID</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-400"
                      >
                        No data present
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-none">
                        <td className="py-3">{u.name}</td>
                        <td>{u.role}</td>
                        <td>{u.employeeId || "-"}</td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs
              ${u.status === "Pending" && "bg-yellow-100 text-yellow-700"}
              ${u.status === "Approved" && "bg-green-100 text-green-700"}
              ${u.status === "Rejected" && "bg-red-100 text-red-700"}
            `}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            {u.status === "Pending" && (
                              <>
                                <button
                                  disabled={updatingUserId === u.id}
                                  onClick={() =>
                                    updateUserStatus(u.id, "Approved")
                                  }
                                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs border
    ${
      updatingUserId === u.id
        ? "opacity-50 cursor-not-allowed"
        : "bg-green-50 text-green-700"
    }
  `}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  disabled={updatingUserId === u.id}
                                  onClick={() =>
                                    updateUserStatus(u.id, "Rejected")
                                  }
                                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs border
    ${
      updatingUserId === u.id
        ? "opacity-50 cursor-not-allowed"
        : "bg-red-50 text-red-700"
    }
  `}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setViewUser(u)}
                              className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border text-xs"
                            >
                              👁 View
                            </button>

                            <button
                              onClick={() => confirmDeleteUser(u)}
                              className="cursor-pointer px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border text-xs"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* ---------- MOBILE USER CARDS ---------- */}
            <div className="md:hidden space-y-3">
              {users.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                  No data present
                </p>
              ) : (
                paginatedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="border rounded-xl p-4 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full text-xs
              ${u.status === "Pending" && "bg-yellow-100 text-yellow-700"}
              ${u.status === "Approved" && "bg-green-100 text-green-700"}
              ${u.status === "Rejected" && "bg-red-100 text-red-700"}
            `}
                      >
                        {u.status}
                      </span>
                    </div>

                    <p className="text-sm">
                      <strong>Employee ID:</strong> {u.employeeId || "-"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {u.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateUserStatus(u.id, "Approved")}
                            className="flex-1 px-3 py-2 text-xs border rounded-lg bg-green-50 text-green-700"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => updateUserStatus(u.id, "Rejected")}
                            className="flex-1 px-3 py-2 text-xs border rounded-lg bg-red-50 text-red-700"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setViewUser(u)}
                        className="flex-1 px-3 py-2 text-xs border rounded-lg bg-blue-50 text-blue-700"
                      >
                        👁 View
                      </button>

                      <button
                        onClick={() => confirmDeleteUser(u)}
                        className="flex-1 px-3 py-2 text-xs border rounded-lg bg-red-50 text-red-700"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* USER PAGINATION */}
            {totalUserPages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                <button
                  disabled={safeUserPage === 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>

                {Array.from({ length: totalUserPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setUserPage(i + 1)}
                    className={`px-3 py-1 border rounded ${
                      safeUserPage === i + 1 ? "bg-black text-white" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={safeUserPage === totalUserPages}
                  onClick={() =>
                    setUserPage((p) => Math.min(totalUserPages, p + 1))
                  }
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>

          {/* ---------- EMPLOYEE ID MASTER (UNCHANGED) ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#10375C] mb-1">
              Employee ID Master
            </h3>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:items-center">
              <input
                placeholder="Search Employee ID"
                value={searchEmpId}
                onChange={(e) => {
                  setSearchEmpId(e.target.value);
                  setEmpIdPage(1); // RESET EMPLOYEE ID PAGINATION
                }}
                className="border rounded-lg px-4 py-2 w-full md:w-64"
              />
              <input
                placeholder="Add Employee ID"
                value={newEmpId}
                onChange={(e) => setNewEmpId(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full md:w-64"
              />
              <button
                onClick={addEmployeeId}
                className="cursor-pointer bg-[#FF5722] text-white px-6 py-2 rounded-lg"
              >
                + Add ID
              </button>

              {/* BULK UPLOAD */}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                📁 Bulk Upload
                <input
                  type="file"
                  accept=".csv,.txt"
                  hidden
                  onChange={(e) => handleBulkUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <ul className="divide-y border rounded-xl overflow-hidden">
              {employeeIds.map((id) => {
                const isLinked = usedEmployeeIds.includes(id);
                return (
                  <li
                    key={id}
                    className="px-4 py-2 flex items-center justify-between min-h-[32px]"
                  >
                    <span>{id}</span>

                    {isLinked ? (
                      <span className="text-xs text-gray-400 leading-none">
                        In use
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmDeleteEmployeeId(id)}
                        className="cursor-pointer text-xs text-red-600 hover:text-red-700 leading-none"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {/* EMPLOYEE ID PAGINATION */}
            {empIdTotalPages > 1 && (
              <div className="flex justify-end gap-2 mt-4 items-center">
                <button
                  disabled={empIdPage === 1}
                  onClick={() => setEmpIdPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded cursor-pointer disabled:cursor-default disabled:opacity-40"
                >
                  Prev
                </button>

                {getEmpIdPageRange(empIdPage, empIdTotalPages).map((p, i) =>
                  typeof p === "string" ? (
                    <span
                      key={`dots-${i}`}
                      className="px-2 text-gray-400 cursor-default select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setEmpIdPage(p)}
                      className={`px-3 py-1 border rounded cursor-pointer ${
                        empIdPage === p ? "bg-black text-white" : ""
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={empIdPage === empIdTotalPages}
                  onClick={() =>
                    setEmpIdPage((p) => Math.min(empIdTotalPages, p + 1))
                  }
                  className="px-3 py-1 border rounded cursor-pointer disabled:cursor-default disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ---------- VIEW MODAL ---------- */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full md:w-[420px] h-full md:h-auto rounded-none md:rounded-2xl p-4 md:p-6 space-y-3 overflow-y-auto">
            <h3 className="text-lg font-semibold">User Details</h3>

            <p>
              <strong>Name:</strong> {viewUser.name}
            </p>
            <p>
              <strong>Email:</strong> {viewUser.email}
            </p>
            <p>
              <strong>Phone:</strong> {viewUser.phone}
            </p>
            <p>
              <strong>Role:</strong> {viewUser.role}
            </p>
            <p>
              <strong>Employee ID:</strong> {viewUser.employeeId || "-"}
            </p>
            <p>
              <strong>Status:</strong> {viewUser.status}
            </p>

            <img src={viewUser.idCard} className="w-full border rounded-lg" />

            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <button
                disabled={
                  viewUser.status === "Approved" ||
                  updatingUserId === viewUser.id
                }
                onClick={() => updateUserStatus(viewUser.id, "Approved")}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-40"
              >
                Approve
              </button>

              <button
                disabled={
                  viewUser.status === "Rejected" ||
                  updatingUserId === viewUser.id
                }
                onClick={() => updateUserStatus(viewUser.id, "Rejected")}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-40"
              >
                Reject
              </button>
            </div>

            <button
              onClick={() => setViewUser(null)}
              className="cursor-pointer w-full py-2 rounded-lg bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmUserOpen}
        title="Delete User?"
        body={`Are you sure you want to delete "${userToDelete?.name}"?`}
        onCancel={() => setConfirmUserOpen(false)}
        onConfirm={handleDeleteUser}
      />

      <ConfirmDialog
        open={confirmEmpIdOpen}
        title="Delete Employee ID?"
        body={`Are you sure you want to delete Employee ID "${empIdToDelete}"?`}
        onCancel={() => setConfirmEmpIdOpen(false)}
        onConfirm={handleDeleteEmployeeId}
      />
    </div>
  );
}

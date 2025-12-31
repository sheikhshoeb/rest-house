"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import useAdminAuth from "../../../components/useAdminAuth";
import StatCard from "../../../components/StatCard";
import ConfirmDialog from "../../../components/ConfirmDialog";

const IMAGE_BASE_URL = "http://localhost:5001";

const EMPTY_PROPERTY_FORM = {
  name: "",
  location: "",
  zoneId: "",
  upiId: "",
  officerName: "",
  officerDesignation: "",
  officerContact: "",
  caretakerName: "",
  caretakerContact: "",
  vvip: 0,
  vip: 0,
  general: 0,
  existingImages: [], // 👈 from server
  newImages: [], // 👈 uploaded now
};

/* ---------- COMMON BUTTON ---------- */
const ActionBtn = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`cursor-pointer px-3 py-1.5 text-xs rounded-lg border whitespace-nowrap ${className}`}
  >
    {children}
  </button>
);

export default function RestHousesPage() {
  const authStatus = useAdminAuth();
  const [zoneSearch, setZoneSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  const [addPropertyOpen, setAddPropertyOpen] = useState(false);

  const [zones, setZones] = useState([]);
  const [properties, setProperties] = useState([]);

  const [propertyForm, setPropertyForm] = useState(EMPTY_PROPERTY_FORM);

  const [editZoneId, setEditZoneId] = useState(null);

  const [viewProperty, setViewProperty] = useState(null);
  const [editPropertyId, setEditPropertyId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    description: "",
    onConfirm: null,
  });

  const fetchZones = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/zones`,
      { credentials: "include" }
    );
    setZones(await res.json());
  };

  const fetchProperties = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/properties`,
      { credentials: "include" }
    );

    if (!res.ok) {
      console.error("Failed to fetch properties");
      return;
    }

    setProperties(await res.json());
  };

  React.useEffect(() => {
    fetchZones();
    fetchProperties();
  }, []);

  const totalZones = zones.length;

  const totalProperties = properties.length;

  const sortedZones = [...zones].sort((a, b) => a.name.localeCompare(b.name));

  const filteredZones = sortedZones.filter((z) =>
    z.name.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.zone?.name?.toLowerCase().includes(propertySearch.toLowerCase())
  );

  if (authStatus !== "authed") return null;

  return (
    <div
      className="min-h-screen bg-white text-[14px]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex pt-4 md:pt-8 px-4 md:px-8 gap-4 md:gap-8">
        {/* Sidebar unchanged */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 space-y-6">
          {/* ---------- STATS ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard title="Total Zones" value={totalZones} />
            <StatCard title="Total Properties" value={totalProperties} />
          </div>

          {/* ---------- ZONES ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[#10375C]">Zones</h3>

              <div className="flex gap-3">
                <input
                  placeholder="Search Zone"
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full md:w-64"
                />
                <ActionBtn
                  className="bg-[#FF5722] text-white w-full md:w-[110px]"
                  onClick={() => setAddZoneOpen(true)}
                >
                  + Add Zone
                </ActionBtn>
              </div>
            </div>

            <div className="hidden md:block">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="w-[40%] text-left">Zone Name</th>
                    <th className="w-[40%] text-left">Properties</th>
                    <th className="w-[20%] text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredZones.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-gray-400 italic"
                      >
                        No zones available
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map((z) => (
                      <tr key={z._id} className="border-b last:border-none">
                        <td className="py-3 break-words">{z.name}</td>
                        <td>
                          {
                            properties.filter((p) => p.zone?._id === z._id)
                              .length
                          }
                        </td>
                        <td className="text-right space-x-2">
                          <ActionBtn
                            className="bg-yellow-50 text-yellow-700"
                            onClick={() => {
                              setEditZoneId(z._id);
                              setNewZoneName(z.name);
                              setAddZoneOpen(true);
                            }}
                          >
                            Edit
                          </ActionBtn>

                          <ActionBtn
                            className="bg-red-50 text-red-700"
                            onClick={() => {
                              setConfirmConfig({
                                title: "Delete Zone",
                                description: `Are you sure you want to delete "${z.name}"? This action cannot be undone.`,
                                onConfirm: async () => {
                                  await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/zones/${z._id}`,
                                    { method: "DELETE", credentials: "include" }
                                  );
                                  fetchZones();
                                  fetchProperties();
                                },
                              });
                              setConfirmOpen(true);
                            }}
                          >
                            Delete
                          </ActionBtn>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {filteredZones.length === 0 ? (
                <p className="py-6 text-center text-gray-400 italic">
                  No zones available
                </p>
              ) : (
                filteredZones.map((z) => (
                  <div key={z._id} className="border rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <p className="font-semibold">{z.name}</p>
                      <span className="text-xs text-gray-500">
                        {properties.filter((p) => p.zone?._id === z._id).length}{" "}
                        properties
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <ActionBtn
                        className="bg-yellow-50 text-yellow-700"
                        onClick={() => {
                          setEditZoneId(z._id);
                          setNewZoneName(z.name);
                          setAddZoneOpen(true);
                        }}
                      >
                        Edit
                      </ActionBtn>

                      <ActionBtn
                        className="bg-red-50 text-red-700"
                        onClick={() => {
                          setConfirmConfig({
                            title: "Delete Zone",
                            description: `Delete "${z.name}"?`,
                            onConfirm: async () => {
                              await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/zones/${z._id}`,
                                { method: "DELETE", credentials: "include" }
                              );
                              fetchZones();
                              fetchProperties();
                            },
                          });
                          setConfirmOpen(true);
                        }}
                      >
                        Delete
                      </ActionBtn>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ---------- PROPERTIES ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[#10375C]">
                Properties
              </h3>

              <div className="flex gap-3">
                <input
                  placeholder="Search Property / Zone"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full md:w-64"
                />
                <ActionBtn
                  className="bg-[#FF5722] text-white w-full md:w-[110px]"
                  onClick={() => {
                    setEditPropertyId(null);
                    setPropertyForm(EMPTY_PROPERTY_FORM);
                    setAddPropertyOpen(true);
                  }}
                >
                  + Add Property
                </ActionBtn>
              </div>
            </div>

            <div className="hidden md:block">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="w-[30%] text-left">Property Name</th>
                    <th className="w-[20%] text-left">Zone</th>
                    <th className="w-[20%] text-left">Location</th>
                    <th className="w-[10%] text-left">Rooms</th>
                    <th className="w-[20%] text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-400 italic"
                      >
                        No properties available
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((p) => (
                      <tr key={p._id} className="border-b last:border-none">
                        <td className="py-3 break-words">{p.name}</td>
                        <td className="break-words">{p.zone?.name}</td>
                        <td className="break-words">{p.location}</td>
                        <td>{p.rooms.vvip + p.rooms.vip + p.rooms.general}</td>
                        <td className="text-right space-x-2">
                          <ActionBtn
                            className="bg-blue-50 text-blue-700"
                            onClick={() => {
                              setViewProperty(p);
                            }}
                          >
                            View
                          </ActionBtn>

                          <ActionBtn
                            className="bg-yellow-50 text-yellow-700"
                            onClick={() => {
                              setEditPropertyId(p._id);
                              setPropertyForm({
                                name: p.name || "",
                                location: p.location || "",
                                zoneId: p.zone?._id || "",
                                upiId: p.upiId || "",
                                officerName: p.officer?.name || "",
                                officerDesignation:
                                  p.officer?.designation || "",
                                officerContact: p.officer?.contact || "",
                                caretakerName: p.caretaker?.name || "",
                                caretakerContact: p.caretaker?.contact || "",
                                vvip: p.rooms?.vvip || 0,
                                vip: p.rooms?.vip || 0,
                                general: p.rooms?.general || 0,
                                existingImages: p.images || [], // array of image URLs from backend
                                newImages: [],
                              });
                              setAddPropertyOpen(true);
                            }}
                          >
                            Edit
                          </ActionBtn>

                          <ActionBtn
                            className="bg-red-50 text-red-700"
                            onClick={() => {
                              setConfirmConfig({
                                title: "Delete Property",
                                description: `Are you sure you want to delete "${p.name}"?`,
                                onConfirm: async () => {
                                  await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/properties/${p._id}`,
                                    { method: "DELETE", credentials: "include" }
                                  );
                                  fetchProperties();
                                },
                              });
                              setConfirmOpen(true);
                            }}
                          >
                            Delete
                          </ActionBtn>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {filteredProperties.length === 0 ? (
                <p className="py-6 text-center text-gray-400 italic">
                  No properties available
                </p>
              ) : (
                filteredProperties.map((p) => (
                  <div key={p._id} className="border rounded-xl p-4 space-y-2">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.zone?.name}</p>
                    <p className="text-sm">{p.location}</p>

                    <p className="text-xs text-gray-600">
                      Rooms: {p.rooms.vvip + p.rooms.vip + p.rooms.general}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <ActionBtn
                        className="bg-blue-50 text-blue-700"
                        onClick={() => setViewProperty(p)}
                      >
                        View
                      </ActionBtn>

                      <ActionBtn
                        className="bg-yellow-50 text-yellow-700"
                        onClick={() => {
                          setEditPropertyId(p._id);
                          setPropertyForm({
                            name: p.name || "",
                            location: p.location || "",
                            zoneId: p.zone?._id || "",
                            upiId: p.upiId || "",
                            officerName: p.officer?.name || "",
                            officerDesignation: p.officer?.designation || "",
                            officerContact: p.officer?.contact || "",
                            caretakerName: p.caretaker?.name || "",
                            caretakerContact: p.caretaker?.contact || "",
                            vvip: p.rooms?.vvip || 0,
                            vip: p.rooms?.vip || 0,
                            general: p.rooms?.general || 0,
                            existingImages: p.images || [],
                            newImages: [],
                          });
                          setAddPropertyOpen(true);
                        }}
                      >
                        Edit
                      </ActionBtn>

                      <ActionBtn
                        className="bg-red-50 text-red-700"
                        onClick={() => {
                          setConfirmConfig({
                            title: "Delete Property",
                            description: `Delete "${p.name}"?`,
                            onConfirm: async () => {
                              await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/properties/${p._id}`,
                                { method: "DELETE", credentials: "include" }
                              );
                              fetchProperties();
                            },
                          });
                          setConfirmOpen(true);
                        }}
                      >
                        Delete
                      </ActionBtn>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
      {/* ---------- ADD ZONE MODAL ---------- */}
      {addZoneOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#10375C]">Add Zone</h3>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Zone Name
              </label>
              <input
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Enter zone name"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                disabled={!newZoneName.trim()}
                onClick={async () => {
                  const url = editZoneId
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/zones/${editZoneId}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/zones`;

                  const method = editZoneId ? "PUT" : "POST";

                  await fetch(url, {
                    method,
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newZoneName }),
                  });

                  setAddZoneOpen(false);
                  setNewZoneName("");
                  setEditZoneId(null);
                  fetchZones();
                }}
                className="cursor-pointer flex-1 bg-[#FF5722] text-white py-2 rounded-lg disabled:cursor-default disabled:opacity-40"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setAddZoneOpen(false);
                  setNewZoneName("");
                  setEditZoneId(null);
                }}
                className="cursor-pointer flex-1 bg-gray-100 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ADD PROPERTY MODAL ---------- */}
      {addPropertyOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setAddPropertyOpen(false);
            setPropertyForm(EMPTY_PROPERTY_FORM);
            setEditPropertyId(null);
          }}
        >
          <div
            className="bg-white w-[1100px] max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================= HEADER ================= */}
            <div className="px-10 py-6 bg-gradient-to-r from-[#F6FAFF] to-white rounded-t-3xl">
              <h3 className="text-2xl font-semibold text-[#10375C]">
                Add Property
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage rest house details, rooms, contacts & payment information
              </p>
            </div>

            {/* ================= BODY ================= */}
            <div className="px-10 py-8 space-y-10">
              <div className="grid grid-cols-[2.3fr_1fr] gap-10">
                {/* ================= LEFT ================= */}
                <div className="space-y-8">
                  {/* ---------- PROPERTY DETAILS ---------- */}
                  <section className="rounded-2xl bg-[#F7FAFC] p-6">
                    <h4 className="text-sm font-semibold text-[#10375C] mb-5 tracking-wide">
                      PROPERTY DETAILS
                    </h4>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs text-gray-600">
                          Property Name
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl px-4 py-2.5 bg-white"
                          value={propertyForm.name}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-600">Zone</label>
                        <select
                          className="mt-1 w-full rounded-xl px-4 py-2.5 bg-white"
                          value={propertyForm.zoneId}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              zoneId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Zone</option>
                          {zones.map((z) => (
                            <option key={z._id} value={z._id}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-gray-600">
                          Address / Location
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl px-4 py-2.5 bg-white"
                          value={propertyForm.location}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* ---------- UPI FIELD (MOVED HERE) ---------- */}
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600">
                          UPI ID (for payments)
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl px-4 py-2.5 bg-white"
                          placeholder="example@upi"
                          value={propertyForm.upiId}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              upiId: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </section>

                  {/* ---------- ROOM CAPACITY ---------- */}
                  <section className="rounded-2xl bg-[#F9F7FF] p-6">
                    <h4 className="text-sm font-semibold text-[#10375C] mb-5 tracking-wide">
                      ROOM CAPACITY
                    </h4>

                    <div className="grid grid-cols-3 gap-5">
                      {[
                        { key: "vvip", label: "VVIP Rooms" },
                        { key: "vip", label: "VIP Rooms" },
                        { key: "general", label: "General Rooms" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-xs text-gray-600">
                            {label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="mt-1 w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm[key]}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                [key]: +e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ---------- CONTACT DETAILS ---------- */}
                  <section className="rounded-2xl bg-[#FFF8F1] p-6">
                    <h4 className="text-sm font-semibold text-[#10375C] mb-6 tracking-wide">
                      CONTACT DETAILS
                    </h4>

                    <div className="grid grid-cols-2 gap-8">
                      {/* OFFICER */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-3">
                          Regarding Officer
                        </p>
                        <div className="space-y-3">
                          <input
                            placeholder="Name"
                            className="w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm.officerName}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                officerName: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Designation"
                            className="w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm.officerDesignation}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                officerDesignation: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Contact Number"
                            className="w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm.officerContact}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                officerContact: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* CARE TAKER */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-3">
                          Care Taker
                        </p>
                        <div className="space-y-3">
                          <input
                            placeholder="Name"
                            className="w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm.caretakerName}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                caretakerName: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Contact Number"
                            className="w-full rounded-xl px-4 py-2.5 bg-white"
                            value={propertyForm.caretakerContact}
                            onChange={(e) =>
                              setPropertyForm({
                                ...propertyForm,
                                caretakerContact: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* ================= RIGHT (IMAGES) ================= */}
                <aside className="rounded-2xl bg-[#F5FAF8] p-6 h-fit">
                  <h4 className="text-sm font-semibold text-[#10375C] mb-4 tracking-wide">
                    PROPERTY IMAGES
                  </h4>

                  <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-sm text-gray-500 hover:bg-white transition">
                    <span className="text-xl">＋</span>
                    <span className="mt-1">Upload Images</span>
                    <input
                      type="file"
                      multiple
                      hidden
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          newImages: [
                            ...propertyForm.newImages,
                            ...Array.from(e.target.files || []),
                          ],
                        })
                      }
                    />
                  </label>

                  {/* ---------- EXISTING IMAGES (FROM SERVER) ---------- */}
                  {propertyForm.existingImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-5">
                      {propertyForm.existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <img
                            src={`${IMAGE_BASE_URL}${img}`}
                            className="h-32 w-full object-cover rounded-xl"
                          />
                          <button
                            onClick={() =>
                              setPropertyForm({
                                ...propertyForm,
                                existingImages:
                                  propertyForm.existingImages.filter(
                                    (_, i) => i !== idx
                                  ),
                              })
                            }
                            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ---------- NEWLY UPLOADED IMAGES ---------- */}
                  {propertyForm.newImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-5">
                      {propertyForm.newImages.map((img, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            className="h-32 w-full object-cover rounded-xl"
                          />
                          <button
                            onClick={() =>
                              setPropertyForm({
                                ...propertyForm,
                                newImages: propertyForm.newImages.filter(
                                  (_, i) => i !== idx
                                ),
                              })
                            }
                            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </aside>
              </div>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="px-10 py-6 bg-[#FAFAFA] flex gap-4 rounded-b-3xl">
              <button
                className="flex-1 bg-[#FF5722] text-white py-3 rounded-xl font-medium hover:opacity-90 transition cursor-pointer"
                onClick={async () => {
                  const formData = new FormData();

                  formData.append("name", propertyForm.name);
                  formData.append("location", propertyForm.location);
                  formData.append("zone", propertyForm.zoneId);
                  formData.append("upiId", propertyForm.upiId);

                  formData.append("vvip", propertyForm.vvip);
                  formData.append("vip", propertyForm.vip);
                  formData.append("general", propertyForm.general);

                  formData.append("officerName", propertyForm.officerName);
                  formData.append(
                    "officerDesignation",
                    propertyForm.officerDesignation
                  );
                  formData.append(
                    "officerContact",
                    propertyForm.officerContact
                  );

                  formData.append("caretakerName", propertyForm.caretakerName);
                  formData.append(
                    "caretakerContact",
                    propertyForm.caretakerContact
                  );

                  formData.append(
                    "existingImages",
                    JSON.stringify(propertyForm.existingImages)
                  );

                  propertyForm.newImages.forEach((file) => {
                    formData.append("images", file);
                  });

                  const url = editPropertyId
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/properties/${editPropertyId}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/rest-houses/properties`;

                  const method = editPropertyId ? "PUT" : "POST";

                  await fetch(url, {
                    method,
                    credentials: "include",
                    body: formData,
                  });

                  setAddPropertyOpen(false);
                  setPropertyForm(EMPTY_PROPERTY_FORM);
                  setEditPropertyId(null);
                  fetchProperties();
                }}
              >
                Save Property
              </button>
              <button
                className="flex-1 bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                onClick={() => setAddPropertyOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {viewProperty && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setViewProperty(null)}
        >
          <div
            className="bg-white w-[600px] rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[#10375C]">
              {viewProperty.name}
            </h3>

            <div className="text-sm space-y-2">
              <p>
                <strong>Zone:</strong> {viewProperty.zone?.name}
              </p>
              <p>
                <strong>Location:</strong> {viewProperty.location}
              </p>
              <p>
                <strong>UPI:</strong> {viewProperty.upiId || "-"}
              </p>

              <p>
                <strong>Rooms:</strong> VVIP {viewProperty.rooms?.vvip || 0},{" "}
                VIP {viewProperty.rooms?.vip || 0}, General{" "}
                {viewProperty.rooms?.general || 0}
              </p>

              <p>
                <strong>Officer:</strong> {viewProperty.officer?.name || "-"}
              </p>
              <p>
                <strong>Care Taker:</strong>{" "}
                {viewProperty.caretaker?.name || "-"}
              </p>
            </div>

            <div className="pt-4 text-right">
              <button
                className="bg-gray-100 px-4 py-2 rounded-lg"
                onClick={() => setViewProperty(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (confirmConfig.onConfirm) {
            await confirmConfig.onConfirm();
          }
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}

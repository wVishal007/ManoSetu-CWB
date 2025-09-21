import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { Navigation } from "../components/Navigation";

export const MySessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await apiService.getMySessions();
        setSessions(res.sessions || []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading sessions...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!sessions.length)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">No sessions found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">My Sessions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const startTime = new Date(s.startTime);
            const canJoin = s.status === "ongoing" || (s.status === "scheduled" && startTime <= new Date());

            const statusColors: Record<string, string> = {
              ongoing: "bg-green-100 text-green-800",
              scheduled: "bg-blue-100 text-blue-800",
              completed: "bg-gray-100 text-gray-500",
            };

            return (
              <div
                key={s._id}
                className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[s.status]}`}>
                      {s.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">{startTime.toLocaleDateString()}</span>
                  </div>

                  <p className="text-gray-700 font-semibold">
                    Therapist: <span className="font-normal">{s.therapist?.name || "Me"}</span>
                  </p>
                  <p className="text-gray-700 font-semibold">
                    User: <span className="font-normal">{s.user?.name || "Me"}</span>
                  </p>

                  <p className="text-gray-600 mt-2">
                    Time: <span className="font-medium">{startTime.toLocaleTimeString()}</span>
                  </p>
                </div>

                <div className="mt-auto">
                  {canJoin && (
                    <button
                      onClick={() => navigate(`/video-call/${s._id}`)}
                      className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${
                        s.status === "ongoing"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {s.status === "ongoing" ? "Join Video Call" : "Start Session"}
                    </button>
                  )}

                  {!canJoin && s.status === "scheduled" && (
                    <p className="text-gray-500 text-sm mt-1">Your session will start soon</p>
                  )}

                  {s.status === "completed" && (
                    <p className="text-gray-400 text-sm mt-1">Session completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

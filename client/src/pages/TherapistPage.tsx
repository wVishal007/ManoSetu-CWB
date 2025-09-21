import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, Therapist, ApiResponse } from "../types/user";
import TherapistCard from "../components/TherapistCard";
import BookingModal from "../components/BookingModal";
import { Navigation } from "../components/Navigation";

const TherapistsPage: React.FC = () => {
  const { user, updateUser } = useAuth(); // Get user and updateUser from context
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);


  const navigate = useNavigate();

  // Fetch therapists on load
  useEffect(() => {
    const loadTherapists = async () => {
      try {
        const therapistsList = await apiService.getTherapists();
        console.log(therapistsList);

        setTherapists(therapistsList);
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load therapists");
      } finally {
        setLoading(false);
      }
    };
    loadTherapists();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const bio = formData.get("bio") as string;
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim());
    const licenseNumber = formData.get("licenseNumber") as string;

    try {
      const res: ApiResponse<User> = await apiService.applyToBeTherapist({
        bio,
        specialties,
        licenseNumber,
      });

      console.log(res);

      if (res.success) {
        toast.success("Application submitted! Awaiting admin approval.");
        updateUser(res.user); // update the user in the AuthContext
        setShowApplyForm(false);
      } else {
        toast.error(res.message || "Failed to apply");
      }
    } catch (err) {
      console.error("Apply error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading therapists...</div>
      </div>
    );
  }

  const isTherapistOrPending =
    user?.role === "therapist" || user?.applicationStatus === "pending";


  return (
    <div>
      <Navigation/>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Meet Our Therapists
      </h1>

      {/* Apply to be therapist section (if not therapist and not pending) */}
      {!isTherapistOrPending && (
        <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Want to become a therapist?
          </h2>
          <p className="text-gray-600 mb-4">
            Help others by sharing your expertise. Apply now and get verified.
          </p>
          {!showApplyForm ? (
            <button
              onClick={() => setShowApplyForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Now
            </button>
          ) : (
            <form
              onSubmit={handleApply}
              className="mt-4 space-y-4 bg-white p-5 rounded-lg shadow"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  required
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself and your approach..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties (comma separated)
                </label>
                <input
                  type="text"
                  name="specialties"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Anxiety, Depression, Trauma..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. PSY123456"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applying}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Show pending message if application is in progress */}
      {user?.applicationStatus === "pending" && (
        <div className="mb-10 p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
          <p className="text-yellow-800 font-semibold">
            Your therapist application is currently under review.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            We will notify you once it has been approved by our team.
          </p>
        </div>
      )}

      {/* Therapist List */}
      {therapists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <TherapistCard
              key={therapist._id}
              therapist={therapist}
              onBook={() => setSelectedTherapist(therapist)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No verified therapists available right now. Check back soon!
        </div>
      )}
      {selectedTherapist && (
  <BookingModal
    therapist={selectedTherapist}
    onClose={() => setSelectedTherapist(null)}
    onConfirm={async (start, end, duration) => {
      try {
        await apiService.scheduleSession({
          therapistId: selectedTherapist._id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          durationMinutes: duration,
        });
        toast.success("Session booked!");
        setSelectedTherapist(null);
      } catch (err) {
        toast.error("Failed to book session");
      }
    }}
  />
)}

    </div>
    </div>
  );
};

export default TherapistsPage;

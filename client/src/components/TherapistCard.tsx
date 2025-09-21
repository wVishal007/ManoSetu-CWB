import React from 'react';
import { Therapist } from '../types/user';

interface TherapistCardProps {
  therapist: Therapist;
  onBook?: () => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onBook }) => {
  const avatarUrl =
    therapist.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      therapist.name
    )}&background=4F46E5&color=fff&size=128&rounded=true`;

  return (
    <div className="border rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col items-center">
      <img
        src={avatarUrl}
        alt={therapist.name}
        className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-gradient-to-r from-blue-300 to-indigo-300 p-1"
      />
      <h3 className="text-xl font-semibold text-gray-800 mb-1 text-center">
        {therapist.name}
      </h3>
      <p className="text-sm text-blue-600 text-center font-medium mb-2">
        {therapist.profile.specialties?.join(', ') || 'General Wellness'}
      </p>
      <p className="text-gray-600 text-center text-sm mb-4 px-2">
        {therapist.profile.bio || 'Dedicated to supporting your mental health journey.'}
      </p>
      <button
        onClick={onBook}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
      >
        Book Session
      </button>
    </div>
  );
};

export default TherapistCard;

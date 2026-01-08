// src/components/booking/ClassSchedule.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// --- Types ---

export interface ClassSlot {
  id: string;
  time: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  availableSpots: number;
  totalSpots: number;
}

export interface DaySchedule {
  date: Date;
  dayName: string;
  slots: ClassSlot[];
}

// Mock API fetcher function
const fetchWeeklySchedule = async (): Promise<DaySchedule[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: DaySchedule[] = [];
      const today = new Date();

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        mockData.push({
          date: date,
          dayName: days[date.getDay()],
          slots: [
            {
              id: `slot-${i}-1`,
              time: '09:00',
              duration: 45,
              level: 'Beginner',
              instructor: 'Sarah Jenkins',
              availableSpots: Math.floor(Math.random() * 5),
              totalSpots: 8,
            },
            {
              id: `slot-${i}-2`,
              time: '10:00',
              duration: 45,
              level: 'Intermediate',
              instructor: 'Mike Ross',
              availableSpots: Math.floor(Math.random() * 10),
              totalSpots: 10,
            },
            {
              id: `slot-${i}-3`,
              time: '14:00',
              duration: 60,
              level: 'Advanced',
              instructor: 'Emily Blunt',
              availableSpots: Math.floor(Math.random() * 4),
              totalSpots: 6,
            },
          ],
        });
      }
      resolve(mockData);
    }, 800);
  });
};

// --- Components ---

interface BookingModalProps {
  selectedClass: ClassSlot | null;
  dayName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ selectedClass, dayName, onClose, onConfirm }) => {
  if (!selectedClass) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Book Swim Class</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Day</span>
            <span className="font-medium text-gray-800">{dayName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-800">{selectedClass.time}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Level</span>
            <span
              className={`px-2 py-0.5 rounded text-sm font-semibold ${
                selectedClass.level === 'Beginner'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedClass.level === 'Intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {selectedClass.level}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Instructor</span>
            <span className="font-medium text-gray-800">{selectedClass.instructor}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Availability</span>
            <span className="font-medium text-gray-800">
              {selectedClass.availableSpots} / {selectedClass.totalSpots} spots
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={selectedClass.availableSpots === 0}
            className={`flex-1 px-4 py-2 rounded-md text-white transition ${
              selectedClass.availableSpots === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {selectedClass.availableSpots === 0 ? 'Full' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const ClassSchedule: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);
  const [selectedDayName, setSelectedDayName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery<DaySchedule[]>({
    queryKey: ['weeklySchedule'],
    queryFn: fetchWeeklySchedule,
  });

  const handleSlotClick = (slot: ClassSlot, dayName: string) => {
    if (slot.availableSpots > 0) {
      setSelectedSlot(slot);
      setSelectedDayName(dayName);
      setIsModalOpen(true);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        Failed to load schedule: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Class Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">Select a slot to book your session</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider col-span-1">
              Time
            </div>
            {data?.map((day) => (
              <div key={day.dayName} className="p-4 text-center border-l border-gray-200">
                <div className="text-sm font-bold text-gray-900">{day.dayName}</div>
                <div className="text-xs text-gray-500">{formatDate(day.date)}</div>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          {data?.[0].slots.map((referenceSlot, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="p-3 text-sm text-gray-600 font-medium flex items-center justify-center bg-gray-50/50">
                {referenceSlot.time}
              </div>

              {data?.map((day) => {
                const slot = day.slots.find((s) => s.time === referenceSlot.time);

                if (!slot) {
                  return <div key={day.dayName} className="p-2 border-l border-gray-100"></div>;
                }

                return (
                  <div key={day.dayName} className="p-2 border-l border-gray-100 h-full">
                    <button
                      onClick={() => handleSlotClick(slot, day.dayName)}
                      disabled={slot.availableSpots === 0}
                      className={`w-full h-full p-3 rounded-md border flex flex-col items-center justify-center text-center transition-all duration-200
                        ${slot.availableSpots === 0
                          ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                          : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer hover:-translate-y-0.5 transform'
                        }
                      `}
                    >
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 border ${getLevelColor(slot.level)}`}>
                        {slot.level}
                      </div>

                      <div className="text-xs font-medium text-gray-700 truncate w-full px-1" title={slot.instructor}>
                        {slot.instructor}
                      </div>

                      <div className={`text-xs mt-1 font-medium ${slot.availableSpots < 3 ? 'text-orange-500' : 'text-green-600'}`}>
                        {slot.availableSpots} left
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-2"></span> Beginner
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 mr-2"></span> Intermediate
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-2"></span> Advanced
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal
          selectedClass={selectedSlot}
          dayName={selectedDayName}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            alert(`Booked ${selectedSlot?.level} class with ${selectedSlot?.instructor}!`);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ClassSchedule;

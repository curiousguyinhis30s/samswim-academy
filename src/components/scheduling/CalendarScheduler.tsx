"use client";

import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Users, X } from 'lucide-react';

// Types
export type LevelType = 'beginner' | 'intermediate' | 'advanced';

export interface Session {
  id: string;
  title: string;
  instructor: string;
  start: Date;
  end: Date;
  capacity: number;
  booked: number;
  level: LevelType;
}

interface CalendarSchedulerProps {
  sessions?: Session[];
  onBook?: (session: Session) => void;
}

// Constants
const LEVEL_COLORS: Record<LevelType, { bg: string; border: string; text: string }> = {
  beginner: { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-900' },
  intermediate: { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-900' },
  advanced: { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-900' },
};

const START_HOUR = 6;
const END_HOUR = 21;
const SLOT_HEIGHT = 48; // pixels per 30 min

// Demo data
const DEMO_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'Kids Beginner',
    instructor: 'Coach Ahmad',
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 0, 0, 0)),
    capacity: 8,
    booked: 5,
    level: 'beginner',
  },
  {
    id: '2',
    title: 'Adult Intermediate',
    instructor: 'Coach Sarah',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    capacity: 6,
    booked: 6,
    level: 'intermediate',
  },
  {
    id: '3',
    title: 'Competition Training',
    instructor: 'Coach Ahmad',
    start: new Date(new Date().setHours(17, 0, 0, 0)),
    end: new Date(new Date().setHours(19, 0, 0, 0)),
    capacity: 4,
    booked: 2,
    level: 'advanced',
  },
];

export function CalendarScheduler({ sessions: initialSessions, onBook }: CalendarSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>(initialSessions || DEMO_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const handleBook = () => {
    if (!selectedSession) return;

    if (selectedSession.booked < selectedSession.capacity) {
      setSessions(prev =>
        prev.map(s =>
          s.id === selectedSession.id ? { ...s, booked: s.booked + 1 } : s
        )
      );
      onBook?.(selectedSession);
    }
    setSelectedSession(null);
  };

  const getSessionStyle = (session: Session) => {
    const startMinutes = session.start.getHours() * 60 + session.start.getMinutes();
    const endMinutes = session.end.getHours() * 60 + session.end.getMinutes();
    const dayStartMinutes = START_HOUR * 60;

    const top = ((startMinutes - dayStartMinutes) / 30) * SLOT_HEIGHT;
    const height = ((endMinutes - startMinutes) / 30) * SLOT_HEIGHT;

    return { top: `${top}px`, height: `${height - 2}px` };
  };

  const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
    const hour = START_HOUR + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return { hour, minute, label: minute === 0 ? format(new Date().setHours(hour, 0), 'ha') : '' };
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Schedule</h2>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-gray-100 rounded-l-lg">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-700 min-w-[180px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={handleNextWeek} className="p-1.5 hover:bg-gray-100 rounded-r-lg">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-gray-600">Beginner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600">Intermediate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-gray-600">Advanced</span>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200">
          <div className="h-10 border-b border-gray-200" />
          <div className="overflow-y-auto" style={{ height: `${timeSlots.length * SLOT_HEIGHT}px` }}>
            {timeSlots.map((slot, i) => (
              <div
                key={i}
                className="flex items-start justify-end pr-2 text-xs text-gray-400 font-medium"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                {slot.label}
              </div>
            ))}
          </div>
        </div>

        {/* Days Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {weekDays.map(day => {
              const isToday = isSameDay(day, new Date());
              const daySessions = sessions.filter(s => isSameDay(s.start, day));

              return (
                <div key={day.toISOString()} className="flex-1 min-w-[120px] border-r border-gray-100">
                  {/* Day Header */}
                  <div
                    className={`h-10 flex flex-col items-center justify-center border-b border-gray-200 ${
                      isToday ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</span>
                    <span
                      className={`text-sm font-bold ${
                        isToday ? 'text-blue-600 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Time Slots */}
                  <div className="relative" style={{ height: `${timeSlots.length * SLOT_HEIGHT}px` }}>
                    {/* Grid lines */}
                    {timeSlots.map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-b border-gray-100"
                        style={{ top: `${i * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                      />
                    ))}

                    {/* Sessions */}
                    {daySessions.map(session => {
                      const colors = LEVEL_COLORS[session.level];
                      const isFull = session.booked >= session.capacity;

                      return (
                        <button
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border-l-4 rounded-r px-2 py-1 text-left overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
                          style={getSessionStyle(session)}
                        >
                          <p className={`text-xs font-semibold ${colors.text} truncate`}>
                            {session.title}
                          </p>
                          <p className="text-[10px] text-gray-600 truncate">{session.instructor}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className={`text-[10px] font-medium ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
                              {session.booked}/{session.capacity}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedSession.title}</h3>
              <button onClick={() => setSelectedSession(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Instructor:</span> {selectedSession.instructor}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time:</span>{' '}
                {format(selectedSession.start, 'h:mm a')} - {format(selectedSession.end, 'h:mm a')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Spots:</span>{' '}
                {selectedSession.capacity - selectedSession.booked} available
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={selectedSession.booked >= selectedSession.capacity}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {selectedSession.booked >= selectedSession.capacity ? 'Full' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarScheduler;

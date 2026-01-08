// src/lib/achievements/badges.ts

/**
 * Badge and Achievement System for SamSwim Academy
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'skill' | 'consistency' | 'milestone' | 'social';
  requirement: string;
}

interface StudentProgress {
  lessonsAttendedCount: number;
  consecutiveWeeksPresent: number;
  level: Record<string, number>;
  totalDistanceMeters: number;
  earlyCheckIns: number;
  lessonsScheduledThisWeek: number;
  lessonsAttendedThisWeek: number;
  referralCount: number;
  equipmentPurchases: number;
  badgesEarned: string[];
}

// Mock database map
const studentProgressDB = new Map<string, StudentProgress>();

/**
 * List of all available badges
 */
export const BADGES: Badge[] = [
  // Milestones
  {
    id: 'first_splash',
    name: 'First Splash',
    description: 'Attended your very first swimming lesson.',
    icon: '💦',
    category: 'milestone',
    requirement: 'Attend 1 lesson',
  },
  {
    id: 'water_baby',
    name: 'Water Baby',
    description: 'Completed 10 swimming lessons.',
    icon: '👶',
    category: 'milestone',
    requirement: 'Attend 10 lessons',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Completed 100 lessons with SamSwim.',
    icon: '💯',
    category: 'milestone',
    requirement: 'Attend 100 lessons',
  },
  {
    id: 'distance_king',
    name: 'Distance King',
    description: 'Swam a cumulative total of 1 kilometer.',
    icon: '🏊‍♂️',
    category: 'milestone',
    requirement: 'Swim 1000m cumulative',
  },

  // Skill
  {
    id: 'stroke_master_freestyle',
    name: 'Freestyle Ace',
    description: 'Reached Level 3 in Freestyle.',
    icon: '🚀',
    category: 'skill',
    requirement: 'Reach Level 3 in Freestyle',
  },
  {
    id: 'stroke_master_backstroke',
    name: 'Backstroke Boss',
    description: 'Reached Level 3 in Backstroke.',
    icon: '🌊',
    category: 'skill',
    requirement: 'Reach Level 3 in Backstroke',
  },
  {
    id: 'butterfly_begins',
    name: 'Butterfly Beginnings',
    description: 'Started learning the Butterfly stroke.',
    icon: '🦋',
    category: 'skill',
    requirement: 'Reach Level 1 in Butterfly',
  },
  {
    id: 'diving_diamond',
    name: 'Diving Diamond',
    description: 'Demonstrated perfect form from the diving block.',
    icon: '💎',
    category: 'skill',
    requirement: 'Coach assessment for diving',
  },

  // Consistency
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Attended every single scheduled lesson in a week.',
    icon: '📅',
    category: 'consistency',
    requirement: 'Attendance = Scheduled in a week',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Checked in 5 minutes early for 5 separate lessons.',
    icon: '🐦',
    category: 'consistency',
    requirement: '5 Early check-ins',
  },
  {
    id: 'iron_student',
    name: 'Iron Student',
    description: 'Maintained a 4-week attendance streak.',
    icon: '🔥',
    category: 'consistency',
    requirement: '4-week consecutive streak',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Completed a lesson scheduled after 7 PM.',
    icon: '🦉',
    category: 'consistency',
    requirement: 'Attend 1 late night lesson',
  },

  // Social
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Participated in a group swim event or relay.',
    icon: '🤝',
    category: 'social',
    requirement: 'Participate in 1 group event',
  },
  {
    id: 'super_sponsor',
    name: 'Super Sponsor',
    description: 'Referred a friend who joined the academy.',
    icon: '🗣️',
    category: 'social',
    requirement: 'Refer 1 friend',
  },
  {
    id: 'gear_head',
    name: 'Gear Head',
    description: 'Purchased professional swim gear (goggles/cap).',
    icon: '🥽',
    category: 'social',
    requirement: 'Buy equipment',
  },
  {
    id: 'legend',
    name: 'SamSwim Legend',
    description: 'Earned every other badge. A true master of the pool.',
    icon: '👑',
    category: 'milestone',
    requirement: 'Earn all other badges',
  },
];

const getStudentProgress = (studentId: string): StudentProgress => {
  if (!studentProgressDB.has(studentId)) {
    studentProgressDB.set(studentId, {
      lessonsAttendedCount: 0,
      consecutiveWeeksPresent: 0,
      level: {},
      totalDistanceMeters: 0,
      earlyCheckIns: 0,
      lessonsScheduledThisWeek: 0,
      lessonsAttendedThisWeek: 0,
      referralCount: 0,
      equipmentPurchases: 0,
      badgesEarned: [],
    });
  }
  return studentProgressDB.get(studentId)!;
};

/**
 * Checks if a student meets the criteria for a specific badge.
 */
export async function checkBadgeEligibility(
  studentId: string,
  badgeId: string
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const badge = BADGES.find((b) => b.id === badgeId);
  if (!badge) return false;

  const progress = getStudentProgress(studentId);

  if (progress.badgesEarned.includes(badgeId)) return false;

  switch (badgeId) {
    case 'first_splash':
      return progress.lessonsAttendedCount >= 1;
    case 'water_baby':
      return progress.lessonsAttendedCount >= 10;
    case 'centurion':
      return progress.lessonsAttendedCount >= 100;
    case 'distance_king':
      return progress.totalDistanceMeters >= 1000;
    case 'stroke_master_freestyle':
      return (progress.level.freestyle || 0) >= 3;
    case 'stroke_master_backstroke':
      return (progress.level.backstroke || 0) >= 3;
    case 'butterfly_begins':
      return (progress.level.butterfly || 0) >= 1;
    case 'perfect_week':
      return (
        progress.lessonsScheduledThisWeek > 0 &&
        progress.lessonsAttendedThisWeek === progress.lessonsScheduledThisWeek
      );
    case 'early_bird':
      return progress.earlyCheckIns >= 5;
    case 'iron_student':
      return progress.consecutiveWeeksPresent >= 4;
    case 'super_sponsor':
      return progress.referralCount >= 1;
    case 'gear_head':
      return progress.equipmentPurchases >= 1;
    case 'legend':
      const otherBadges = BADGES.filter((b) => b.id !== 'legend');
      return otherBadges.every((b) => progress.badgesEarned.includes(b.id));
    default:
      return false;
  }
}

/**
 * Awards a badge to a student.
 */
export async function awardBadge(
  studentId: string,
  badgeId: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const progress = getStudentProgress(studentId);
  if (!progress.badgesEarned.includes(badgeId)) {
    progress.badgesEarned.push(badgeId);
    console.log(`[SamSwim] Badge '${badgeId}' awarded to ${studentId}`);
  }
}

/**
 * Retrieves all badges earned by a student.
 */
export async function getStudentBadges(studentId: string): Promise<Badge[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const progress = getStudentProgress(studentId);
  return BADGES.filter((badge) => progress.badgesEarned.includes(badge.id));
}

/**
 * Retrieves all badges that a student has not yet earned.
 */
export async function getAvailableBadges(studentId: string): Promise<Badge[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const progress = getStudentProgress(studentId);
  return BADGES.filter((badge) => !progress.badgesEarned.includes(badge.id));
}

// Helper for testing
export function resetStudentData(studentId: string) {
  studentProgressDB.delete(studentId);
}

export function updateStudentProgress(
  studentId: string,
  updates: Partial<StudentProgress>
) {
  const progress = getStudentProgress(studentId);
  Object.assign(progress, updates);
}

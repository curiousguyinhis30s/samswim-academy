// src/lib/progress/tracking.ts

/**
 * Progress Tracking Service for SamSwim Academy
 * Handles skill definitions, student progress tracking, and analytics.
 */

// 1. Enums
export enum SkillCategory {
  WATER_SAFETY = 'WATER_SAFETY',
  STROKE_TECHNIQUE = 'STROKE_TECHNIQUE',
  ENDURANCE = 'ENDURANCE',
  DIVING = 'DIVING',
  COMPETITIVE = 'COMPETITIVE',
}

export type Level = 1 | 2 | 3 | 4 | 5;

// 2. Interfaces
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: Level;
  description: string;
}

export interface StudentProgress {
  studentId: string;
  skillId: string;
  currentLevel: Level;
  attempts: number;
  lastAssessed: Date;
  coachNotes?: string;
}

export interface SkillMatrixItem {
  skill: Skill;
  progress?: StudentProgress;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'MASTERED';
}

export interface OverallStats {
  totalLevels: number;
  earnedLevels: number;
  overallPercentage: number;
  suggestedLevel: Level;
}

// In-memory storage (Replace with DB calls in production)
let studentProgressDB: StudentProgress[] = [];

// 4. SWIMMING_SKILLS Array
export const SWIMMING_SKILLS: Skill[] = [
  // Water Safety
  { id: 'ws-01', name: 'Safe Entry', category: SkillCategory.WATER_SAFETY, level: 1, description: 'Safe pool entry using ladder or stairs.' },
  { id: 'ws-02', name: 'Bobbing & Breath Control', category: SkillCategory.WATER_SAFETY, level: 1, description: 'Rhythmic bobbing with exhalation underwater.' },
  { id: 'ws-03', name: 'Front Float Recovery', category: SkillCategory.WATER_SAFETY, level: 2, description: 'Front float (glide) and recovery to standing.' },
  { id: 'ws-04', name: 'Back Float Recovery', category: SkillCategory.WATER_SAFETY, level: 2, description: 'Back float and recovery to vertical position.' },
  { id: 'ws-05', name: 'Treading Water', category: SkillCategory.WATER_SAFETY, level: 3, description: 'Maintain vertical position for 60 seconds.' },
  { id: 'ws-06', name: 'Deep Water Comfort', category: SkillCategory.WATER_SAFETY, level: 4, description: 'Retrieving object from bottom of deep end (8-10ft).' },

  // Stroke Technique
  { id: 'st-01', name: 'Freestyle Kick', category: SkillCategory.STROKE_TECHNIQUE, level: 1, description: 'Straight leg flutter kick on front.' },
  { id: 'st-02', name: 'Backstroke Kick', category: SkillCategory.STROKE_TECHNIQUE, level: 1, description: 'Straight leg flutter kick on back.' },
  { id: 'st-03', name: 'Freestyle Arm Pull', category: SkillCategory.STROKE_TECHNIQUE, level: 2, description: 'Alternating arm action with high elbow recovery.' },
  { id: 'st-04', name: 'Backstroke Arm Pull', category: SkillCategory.STROKE_TECHNIQUE, level: 2, description: 'Straight arm recovery with pinky entry.' },
  { id: 'st-05', name: 'Breaststroke Kick', category: SkillCategory.STROKE_TECHNIQUE, level: 3, description: 'Whip kick with dorsiflexed feet.' },
  { id: 'st-06', name: 'Butterfly Body Dolphin', category: SkillCategory.STROKE_TECHNIQUE, level: 4, description: 'Rhythmic whole-body undulation.' },
  { id: 'st-07', name: 'Flip Turn', category: SkillCategory.STROKE_TECHNIQUE, level: 4, description: 'Freestyle somersault turn.' },
  { id: 'st-08', name: 'IM Transition Turns', category: SkillCategory.STROKE_TECHNIQUE, level: 5, description: 'Efficient turns from Back to Breast, Breast to Free.' },

  // Endurance
  { id: 'en-01', name: '25 Yard Swim', category: SkillCategory.ENDURANCE, level: 2, description: 'Swim 25 yards without stopping.' },
  { id: 'en-02', name: '50 Yard Continuous', category: SkillCategory.ENDURANCE, level: 3, description: 'Swim 50 yards continuously.' },
  { id: 'en-03', name: '100 Yard Continuous', category: SkillCategory.ENDURANCE, level: 3, description: 'Swim 100 yards continuously.' },
  { id: 'en-04', name: '200 Yard Swim', category: SkillCategory.ENDURANCE, level: 4, description: 'Swim 200 yards continuously demonstrating technique.' },
  { id: 'en-05', name: '500 Yard Swim', category: SkillCategory.ENDURANCE, level: 5, description: 'Swim 500 yards continuously.' },

  // Diving
  { id: 'dv-01', name: 'Seated Dive', category: SkillCategory.DIVING, level: 2, description: 'Seated dive entry from poolside.' },
  { id: 'dv-02', name: 'Kneeling Dive', category: SkillCategory.DIVING, level: 3, description: 'Kneeling dive entry.' },
  { id: 'dv-03', name: 'Standing Shallow Dive', category: SkillCategory.DIVING, level: 4, description: 'Standing dive from the deck into deep water.' },
  { id: 'dv-04', name: 'Racing Start', category: SkillCategory.DIVING, level: 5, description: 'Track start with efficient entry angle.' },

  // Competitive
  { id: 'cp-01', name: 'Lane Etiquette', category: SkillCategory.COMPETITIVE, level: 3, description: 'Understanding circle swimming and right-of-way.' },
  { id: 'cp-02', name: 'Pacing', category: SkillCategory.COMPETITIVE, level: 4, description: 'Maintaining consistent split times.' },
  { id: 'cp-03', name: 'Relay Takeoff', category: SkillCategory.COMPETITIVE, level: 5, description: 'Arm swing and timing for relay exchanges.' },
];

/**
 * Updates or creates a student's progress record for a specific skill.
 */
export function updateSkillProgress(
  studentId: string,
  skillId: string,
  newLevel: Level,
  notes?: string
): StudentProgress {
  const existingIndex = studentProgressDB.findIndex(
    (p) => p.studentId === studentId && p.skillId === skillId
  );

  const progressData: StudentProgress = {
    studentId,
    skillId,
    currentLevel: newLevel,
    attempts: existingIndex >= 0 ? studentProgressDB[existingIndex].attempts + 1 : 1,
    lastAssessed: new Date(),
    coachNotes: notes,
  };

  if (existingIndex >= 0) {
    studentProgressDB[existingIndex] = progressData;
  } else {
    studentProgressDB.push(progressData);
  }

  return progressData;
}

/**
 * Retrieves the complete matrix of skills and the student's current status in each.
 */
export function getStudentSkillMatrix(studentId: string): SkillMatrixItem[] {
  return SWIMMING_SKILLS.map((skill) => {
    const progress = studentProgressDB.find(
      (p) => p.studentId === studentId && p.skillId === skill.id
    );

    let status: SkillMatrixItem['status'] = 'NOT_STARTED';
    if (progress) {
      if (progress.currentLevel >= 4) status = 'MASTERED';
      else status = 'IN_PROGRESS';
    }

    return {
      skill,
      progress,
      status,
    };
  });
}

/**
 * Calculates the overall swim level based on weighted average of mastered skills.
 */
export function calculateOverallLevel(studentId: string): OverallStats {
  const matrix = getStudentSkillMatrix(studentId);
  let totalPoints = 0;
  let earnedPoints = 0;

  matrix.forEach((item) => {
    const skillMaxPoint = item.skill.level;
    totalPoints += skillMaxPoint;

    if (item.progress) {
      const score = (item.progress.currentLevel / 5) * item.skill.level;
      earnedPoints += score;
    }
  });

  const overallPercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  let suggestedLevel: Level = 1;
  if (overallPercentage >= 90) suggestedLevel = 5;
  else if (overallPercentage >= 70) suggestedLevel = 4;
  else if (overallPercentage >= 50) suggestedLevel = 3;
  else if (overallPercentage >= 30) suggestedLevel = 2;

  return {
    totalLevels: totalPoints,
    earnedLevels: Math.round(earnedPoints),
    overallPercentage: Math.round(overallPercentage),
    suggestedLevel: suggestedLevel,
  };
}

/**
 * Suggests next skills to work on based on prerequisites and gaps.
 */
export function getSkillRecommendations(studentId: string): Skill[] {
  const matrix = getStudentSkillMatrix(studentId);
  const recommendations: Skill[] = [];

  const isMastered = (status: SkillMatrixItem['status']) => status === 'MASTERED';
  const isNotStarted = (status: SkillMatrixItem['status']) => status === 'NOT_STARTED';

  // 1. Prioritize Water Safety Gaps
  const safetyGaps = matrix
    .filter(
      (m) => m.skill.category === SkillCategory.WATER_SAFETY && !isMastered(m.status)
    )
    .sort((a, b) => a.skill.level - b.skill.level);

  if (safetyGaps.length > 0) {
    return safetyGaps.slice(0, 2).map((item) => item.skill);
  }

  // 2. Check for Stroke foundations not started
  const strokeGaps = matrix.filter(
    (m) => m.skill.category === SkillCategory.STROKE_TECHNIQUE && isNotStarted(m.status)
  );

  if (strokeGaps.length > 0) {
    return strokeGaps.slice(0, 3).map((item) => item.skill);
  }

  // 3. Find the lowest level "In Progress" stroke to finish
  const strokesInProgress = matrix
    .filter(
      (m) => m.skill.category === SkillCategory.STROKE_TECHNIQUE && m.status === 'IN_PROGRESS'
    )
    .sort((a, b) => a.skill.level - b.skill.level);

  if (strokesInProgress.length > 0) {
    recommendations.push(strokesInProgress[0].skill);
  }

  // 4. Add Endurance if strokes are established
  const enduranceGaps = matrix.filter(
    (m) => m.skill.category === SkillCategory.ENDURANCE && !isMastered(m.status)
  );

  if (enduranceGaps.length > 0 && recommendations.length < 3) {
    recommendations.push(enduranceGaps[0].skill);
  }

  // 5. Fallback: Competitive skills
  if (recommendations.length < 3) {
    const competitiveGaps = matrix.filter(
      (m) => m.skill.category === SkillCategory.COMPETITIVE && isNotStarted(m.status)
    );
    if (competitiveGaps.length > 0) {
      recommendations.push(competitiveGaps[0].skill);
    }
  }

  return recommendations.slice(0, 3);
}

// Reset function for testing
export function resetProgressDB() {
  studentProgressDB = [];
}

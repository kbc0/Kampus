// Placeholder academic programs by university
export const universityPrograms = {
  'Boğaziçi': {
    majors: ['Computer Engineering', 'Industrial Engineering', 'Economics'],
    minors: ['Data Science', 'Business Analytics', 'Mathematics']
  },
  'Bilkent': {
    majors: ['Computer Science', 'Electrical Engineering', 'Business Administration'],
    minors: ['Psychology', 'Digital Design', 'Economics']
  },
  // Add other universities...
} as const;

// Placeholder subjects
export const subjects = [
  'Calculus I',
  'Linear Algebra',
  'Data Structures',
  'Algorithms',
  'Database Systems',
  'Operating Systems',
  'Machine Learning',
  'Artificial Intelligence',
  'Computer Networks',
  'Software Engineering'
] as const;

export type Subject = typeof subjects[number];
export type University = keyof typeof universityPrograms;
export type Major = typeof universityPrograms[University]['majors'][number];
export type Minor = typeof universityPrograms[University]['minors'][number];
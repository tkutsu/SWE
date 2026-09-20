/**
 * Concept groups that are about the interview itself rather than about the
 * subject matter. They sit at the end with the guides, under one heading, so
 * the knowledge and the interview craft are not interleaved.
 */
export const INTERVIEW_CONCEPT_GROUPS = ['when-you-don-t-know']

export const isInterviewGroup = (id: string): boolean => INTERVIEW_CONCEPT_GROUPS.includes(id)

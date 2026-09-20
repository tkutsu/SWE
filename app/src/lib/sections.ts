/**
 * Concept groups that are about the interview itself rather than about the
 * subject matter. They sit at the end with the guides, under one heading, so
 * the knowledge and the interview craft are not interleaved.
 */
export const INTERVIEW_CONCEPT_GROUPS = ['when-you-don-t-know']

export const isInterviewGroup = (id: string): boolean => INTERVIEW_CONCEPT_GROUPS.includes(id)

/**
 * Guide groups that belong at the top rather than at the end. How to attack a
 * problem is not something you read after the algorithms; it is the thing you
 * use on all of them.
 */
export const START_HERE_GUIDE_GROUPS = ['in-the-room']

export const isStartHereGroup = (id: string): boolean => START_HERE_GUIDE_GROUPS.includes(id)

export type AssignmentKey = 'me' | 'co' | 'both' | 'pool'

export interface AssignmentPatch {
  assigned_to: string | null
  shared: boolean
}

/** Traduit un choix d'assignation en patch `{ assigned_to, shared }`. */
export function assignmentPatch(
  key: AssignmentKey,
  meId: string,
  coId: string | null,
): AssignmentPatch {
  switch (key) {
    case 'me':
      return { assigned_to: meId, shared: false }
    case 'co':
      return coId
        ? { assigned_to: coId, shared: false }
        : { assigned_to: null, shared: false }
    case 'both':
      return { assigned_to: null, shared: true }
    case 'pool':
    default:
      return { assigned_to: null, shared: false }
  }
}

import { describe, it, expect } from 'vitest'
import { assignmentPatch } from './assignment'

describe('assignmentPatch', () => {
  it('me → assigné au parent courant', () => {
    expect(assignmentPatch('me', 'A', 'B')).toEqual({ assigned_to: 'A', shared: false })
  })

  it('co → assigné au co-parent', () => {
    expect(assignmentPatch('co', 'A', 'B')).toEqual({ assigned_to: 'B', shared: false })
  })

  it('both → partagée (assigned_to null, shared true)', () => {
    expect(assignmentPatch('both', 'A', 'B')).toEqual({ assigned_to: null, shared: true })
  })

  it('pool → réserve (assigned_to null, shared false)', () => {
    expect(assignmentPatch('pool', 'A', 'B')).toEqual({ assigned_to: null, shared: false })
  })

  it('co sans co-parent retombe sur la réserve', () => {
    expect(assignmentPatch('co', 'A', null)).toEqual({ assigned_to: null, shared: false })
  })
})

import { describe, expect, it } from 'vitest';
import { personaRules } from '../src/data/persona.private';

describe('hidden persona rules', () => {
  it('requires first-person answers and no private quotations', () => {
    expect(personaRules.voice).toBe('first_person');
    expect(personaRules.privateMaterialPolicy).toBe('summarize_without_quoting');
  });

  it('keeps persona hidden from navigation by design', () => {
    expect(personaRules.publicRoute).toBeNull();
  });
});

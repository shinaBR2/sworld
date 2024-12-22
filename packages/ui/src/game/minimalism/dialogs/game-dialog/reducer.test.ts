import { describe, it, expect } from 'vitest';
import { DialogueContent, DialogueChoice } from '../../../types/dialog';
import {
  dialogueReducer,
  initialState,
  DEFAULT_CHARACTERS_PER_PAGE,
} from './reducer';

describe('splitTextIntoPages', () => {
  const testDialogue: DialogueContent = {
    speaker: 'Johan',
    text: 'This is a test dialogue with multiple words that should be split into pages based on character count.',
    choices: [],
  };

  const shortDialogue: DialogueContent = {
    speaker: 'Johan',
    text: 'Short text',
    choices: [],
  };

  it('should create initial state correctly', () => {
    const state = initialState(testDialogue, 20);

    expect(state).toEqual({
      displayedText: '',
      isTyping: true,
      selectedChoiceIndex: 0,
      currentChoices: [],
      currentDialogue: testDialogue,
      textPages: expect.any(Array),
      currentPageIndex: 0,
      showContinuePrompt: false,
      charsPerPage: 20,
      isLastPage: false,
    });
  });

  it('should set isLastPage true for single-page dialogue', () => {
    const state = initialState(shortDialogue, 20);
    expect(state.isLastPage).toBe(true);
  });
});

describe('dialogueReducer', () => {
  const baseDialogue: DialogueContent = {
    speaker: 'Johan',
    text: 'Test dialogue',
    choices: [],
  };

  const baseState = initialState(baseDialogue, DEFAULT_CHARACTERS_PER_PAGE);

  describe('TYPE_CHAR action', () => {
    it('should append character to displayedText', () => {
      const action = { type: 'TYPE_CHAR' as const, payload: { char: 'a' } };
      const newState = dialogueReducer(baseState, action);

      expect(newState.displayedText).toBe('a');
    });
  });

  describe('COMPLETE_TYPING action', () => {
    it('should complete typing current page', () => {
      const state = {
        ...baseState,
        textPages: ['Page 1', 'Page 2'],
        currentPageIndex: 0,
      };

      const action = { type: 'COMPLETE_TYPING' as const };
      const newState = dialogueReducer(state, action);

      expect(newState.isTyping).toBe(false);
      expect(newState.displayedText).toBe('Page 1');
      expect(newState.showContinuePrompt).toBe(true);
      expect(newState.isLastPage).toBe(false);
    });

    it('should show choices on last page', () => {
      const choices: DialogueChoice[] = [
        { text: 'Choice 1' },
        { text: 'Choice 2' },
      ];

      const state = {
        ...baseState,
        textPages: ['Last page'],
        currentPageIndex: 0,
        currentDialogue: { ...baseDialogue, choices },
      };

      const action = { type: 'COMPLETE_TYPING' as const };
      const newState = dialogueReducer(state, action);

      expect(newState.currentChoices).toEqual(choices);
      expect(newState.isLastPage).toBe(true);
      expect(newState.showContinuePrompt).toBe(false);
    });
  });

  describe('FORCE_COMPLETE_TYPING action', () => {
    it('should force complete typing with specific text', () => {
      const action = {
        type: 'FORCE_COMPLETE_TYPING' as const,
        payload: { text: 'Forced text' },
      };
      const newState = dialogueReducer(baseState, action);

      expect(newState.isTyping).toBe(false);
      expect(newState.displayedText).toBe('Forced text');
    });
  });

  describe('SELECT_CHOICE action', () => {
    it('should update selected choice index', () => {
      const action = {
        type: 'SELECT_CHOICE' as const,
        payload: { index: 1 },
      };
      const newState = dialogueReducer(baseState, action);

      expect(newState.selectedChoiceIndex).toBe(1);
    });
  });

  describe('SET_NEXT_DIALOGUE action', () => {
    it('should set up new dialogue correctly', () => {
      const nextDialogue: DialogueContent = {
        speaker: 'Johan',
        text: 'Next dialogue text',
        choices: [],
      };

      const action = {
        type: 'SET_NEXT_DIALOGUE' as const,
        payload: { dialogue: nextDialogue },
      };
      const newState = dialogueReducer(baseState, action);

      expect(newState.currentDialogue).toEqual(nextDialogue);
      expect(newState.isTyping).toBe(true);
      expect(newState.displayedText).toBe('');
      expect(newState.currentPageIndex).toBe(0);
    });
  });

  describe('NEXT_PAGE action', () => {
    it('should advance to next page correctly', () => {
      const state = {
        ...baseState,
        textPages: ['Page 1', 'Page 2'],
        currentPageIndex: 0,
        displayedText: 'Page 1',
      };

      const action = { type: 'NEXT_PAGE' as const };
      const newState = dialogueReducer(state, action);

      expect(newState.currentPageIndex).toBe(1);
      expect(newState.displayedText).toBe('');
      expect(newState.isTyping).toBe(true);
      expect(newState.isLastPage).toBe(true);
    });
  });

  describe('RESET action', () => {
    it('should reset state with new dialogue', () => {
      const newDialogue: DialogueContent = {
        speaker: 'Johan',
        text: 'New dialogue after reset',
        choices: [],
      };

      const action = {
        type: 'RESET' as const,
        payload: { dialogue: newDialogue },
      };
      const newState = dialogueReducer(baseState, action);

      expect(newState).toEqual(
        initialState(newDialogue, DEFAULT_CHARACTERS_PER_PAGE)
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const emptyDialogue: DialogueContent = {
        speaker: 'Johan',
        text: '',
        choices: [],
      };

      const state = initialState(emptyDialogue, DEFAULT_CHARACTERS_PER_PAGE);
      expect(state.textPages).toEqual([]);
      expect(state.isLastPage).toBe(true);
    });

    it('should handle very long words', () => {
      const longWordDialogue: DialogueContent = {
        speaker: 'Johan',
        text: 'Normal VeryLongWordThatExceedsPageLimit Normal',
        choices: [],
      };

      const state = initialState(longWordDialogue, 10);
      expect(state.textPages.length).toBeGreaterThan(1);
    });

    it('should return same state for unknown action type', () => {
      const action = { type: 'UNKNOWN' as any };
      const newState = dialogueReducer(baseState, action);
      expect(newState).toEqual(baseState);
    });
  });
});

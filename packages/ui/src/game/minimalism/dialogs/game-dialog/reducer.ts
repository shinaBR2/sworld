import { DialogueChoice, DialogueContent } from '../../../types/dialog';

export type DialogueAction =
  | { type: 'TYPE_CHAR'; payload: { char: string } }
  | { type: 'COMPLETE_TYPING' }
  | { type: 'FORCE_COMPLETE_TYPING'; payload: { text: string } }
  | { type: 'SELECT_CHOICE'; payload: { index: number } }
  | { type: 'SET_NEXT_DIALOGUE'; payload: { dialogue: DialogueContent } }
  | { type: 'NEXT_PAGE' }
  | { type: 'RESET'; payload: { dialogue: DialogueContent } };

type DialogueState = {
  displayedText: string;
  isTyping: boolean;
  selectedChoiceIndex: number;
  currentChoices: DialogueChoice[];
  currentDialogue: DialogueContent;
  textPages: string[];
  currentPageIndex: number;
  showContinuePrompt: boolean;
  charsPerPage: number;
  isLastPage: boolean;
};

const DEFAULT_CHARACTERS_PER_PAGE = 100;

const splitTextIntoPages = (text: string, charsPerPage: number): string[] => {
  const words = text.split(' ');
  const pages: string[] = [];
  let currentPage = '';

  for (const word of words) {
    const potentialLine = currentPage + (currentPage ? ' ' : '') + word;

    if (potentialLine.length > charsPerPage) {
      pages.push(currentPage);
      currentPage = word;
    } else {
      currentPage = potentialLine;
    }
  }

  if (currentPage) {
    pages.push(currentPage);
  }

  return pages;
};

const dialogueReducer = (
  state: DialogueState,
  action: DialogueAction
): DialogueState => {
  let isLastPage;

  switch (action.type) {
    case 'TYPE_CHAR':
      return {
        ...state,
        displayedText: state.displayedText + action.payload.char,
      };

    case 'COMPLETE_TYPING':
      isLastPage = state.currentPageIndex === state.textPages.length - 1;
      return {
        ...state,
        isTyping: false,
        displayedText: state.textPages[state.currentPageIndex],
        showContinuePrompt: !isLastPage,
        currentChoices: isLastPage ? state.currentDialogue.choices || [] : [],
        isLastPage,
      };

    case 'FORCE_COMPLETE_TYPING':
      isLastPage = state.currentPageIndex === state.textPages.length - 1;
      return {
        ...state,
        isTyping: false,
        displayedText: action.payload.text,
        showContinuePrompt: !isLastPage,
        currentChoices: isLastPage ? state.currentDialogue.choices || [] : [],
        isLastPage,
      };

    case 'SELECT_CHOICE':
      return {
        ...state,
        selectedChoiceIndex: action.payload.index,
      };

    case 'SET_NEXT_DIALOGUE':
      const newPages = splitTextIntoPages(
        action.payload.dialogue.text,
        state.charsPerPage
      );

      return {
        ...state,
        currentDialogue: action.payload.dialogue,
        displayedText: '',
        isTyping: true,
        selectedChoiceIndex: 0,
        currentChoices: [],
        textPages: newPages,
        currentPageIndex: 0,
        showContinuePrompt: false,
        isLastPage: newPages.length === 1,
      };

    case 'NEXT_PAGE':
      const newPageIndex = state.currentPageIndex + 1;
      isLastPage = newPageIndex === state.textPages.length - 1;

      return {
        ...state,
        currentPageIndex: state.currentPageIndex + 1,
        displayedText: '',
        isTyping: true,
        showContinuePrompt: false,
        isLastPage,
      };

    case 'RESET':
      return initialState(action.payload.dialogue, DEFAULT_CHARACTERS_PER_PAGE);

    default:
      return state;
  }
};

const initialState = (
  dialogue: DialogueContent,
  charsPerPage: number
): DialogueState => {
  const pages = splitTextIntoPages(dialogue.text, charsPerPage);

  return {
    displayedText: '',
    isTyping: true,
    selectedChoiceIndex: 0,
    currentChoices: [],
    currentDialogue: dialogue,
    textPages: pages,
    currentPageIndex: 0,
    showContinuePrompt: false,
    charsPerPage,
    isLastPage: pages.length <= 1,
  };
};

export { dialogueReducer, initialState, DEFAULT_CHARACTERS_PER_PAGE };

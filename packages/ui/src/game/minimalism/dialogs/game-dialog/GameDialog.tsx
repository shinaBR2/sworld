import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { useEffect, useReducer } from 'react';
import { DialogueChoice, GameDialogProps } from '../../../types/dialog';
import {
  DEFAULT_CHARACTERS_PER_PAGE,
  dialogueReducer,
  initialState,
} from './reducer';

const GameDialog = (props: GameDialogProps) => {
  const {
    isOpen,
    onClose,
    dialogue,
    typewriterSpeed = 50,
    charsPerPage = DEFAULT_CHARACTERS_PER_PAGE,
  } = props;
  const [state, dispatch] = useReducer(
    dialogueReducer,
    { charsPerPage, dialogue },
    () => initialState(dialogue, charsPerPage)
  );

  const hasChoices = state.currentChoices.length > 0;
  const isEndOfText = !state.isTyping && state.isLastPage;
  /**
   * End of conversation, no more choices, no more dialogues
   * The only action now is closing the dialog
   */
  const isConversationEnd = isEndOfText && !hasChoices;

  /**
   * Only show choices when text is finish typing
   */
  const shouldShowChoice = isEndOfText && hasChoices;

  /**
   * Should show action button to either:
   * - Move to the next page of text
   * - Close dialog when no more actionable
   */
  const canGoNextTextPage = state.showContinuePrompt && !state.isTyping;
  const shouldShowAction = canGoNextTextPage || isConversationEnd;
  const actionLabel = canGoNextTextPage ? 'Next' : 'Close';

  const handleChoiceSelect = (choice: DialogueChoice) => {
    if (choice.nextDialogue) {
      dispatch({
        type: 'SET_NEXT_DIALOGUE',
        payload: { dialogue: choice.nextDialogue },
      });
    } else if (choice.callback) {
      choice.callback();
    } else {
      onClose();
    }
  };

  const handleInteraction = () => {
    if (state.isTyping) {
      // Complete current page immediately
      dispatch({
        type: 'FORCE_COMPLETE_TYPING',
        payload: {
          text: state.textPages[state.currentPageIndex],
        },
      });
    } else if (state.showContinuePrompt) {
      // Move to next page
      dispatch({ type: 'NEXT_PAGE' });
    } else if (state.isLastPage && state.currentChoices.length > 0) {
      // Select current choice
      handleChoiceSelect(state.currentChoices[state.selectedChoiceIndex]);
    } else if (state.isLastPage && state.currentChoices.length === 0) {
      // Close dialog
      onClose();
    }
  };

  const handleActionButton = () => {
    if (isConversationEnd) {
      onClose();
      return;
    }

    handleInteraction();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].indexOf(e.key) > -1) {
      e.preventDefault();
    }

    // If typing, pressing any key should complete the typing
    if (state.isTyping) {
      handleInteraction();
      return;
    }

    // If there's more text (show continue prompt), handle navigation
    if (state.showContinuePrompt) {
      if (e.key === 'Enter' || e.key === ' ') {
        handleInteraction();
      }
      return;
    }

    // If we have choices and we're on the last page, handle choice navigation
    if (shouldShowChoice) {
      const { currentChoices, selectedChoiceIndex } = state;
      const numberOfChoices = currentChoices.length;

      switch (e.key) {
        case 'ArrowUp':
          dispatch({
            type: 'SELECT_CHOICE',
            payload: {
              index:
                (selectedChoiceIndex - 1 + numberOfChoices) % numberOfChoices,
            },
          });
          break;

        case 'ArrowDown':
          dispatch({
            type: 'SELECT_CHOICE',
            payload: {
              index: (selectedChoiceIndex + 1) % numberOfChoices,
            },
          });
          break;

        case 'Enter':
        case ' ':
          handleChoiceSelect(currentChoices[selectedChoiceIndex]);
          break;
      }
      return;
    }

    // If we're on the last page with no choices, Enter/Space should close
    if (state.isLastPage && (e.key === 'Enter' || e.key === ' ')) {
      onClose();
    }
  };

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: 'RESET', payload: { dialogue } });
      return;
    }

    const currentPageText = state.textPages[state.currentPageIndex];

    let index = 0;
    let timeoutId: number | undefined;

    const typeNextChar = () => {
      if (index < currentPageText.length) {
        dispatch({
          type: 'TYPE_CHAR',
          payload: { char: currentPageText[index] },
        });
        index++;
        // @ts-ignore
        timeoutId = setTimeout(typeNextChar, typewriterSpeed);
      } else {
        dispatch({ type: 'COMPLETE_TYPING' });
      }
    };

    typeNextChar();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, state.currentPageIndex, typewriterSpeed]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    state.isTyping,
    state.showContinuePrompt,
    state.currentChoices,
    state.selectedChoiceIndex,
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="bg-opacity-90"
    >
      <DialogTitle className="bg-gray-800 text-yellow-400">
        {state.currentDialogue.speaker}
      </DialogTitle>
      <DialogContent className="bg-gray-800">
        <Typography className="text-white py-4">
          {state.displayedText}
        </Typography>
        {shouldShowChoice && (
          <Stack spacing={1} className="mt-4">
            {state.currentChoices.map((choice, index) => (
              <Button
                key={index}
                variant={
                  state.selectedChoiceIndex === index ? 'contained' : 'outlined'
                }
                className={`
                  text-left px-4 py-2
                  ${
                    state.selectedChoiceIndex === index
                      ? 'bg-blue-600'
                      : 'border-blue-400 text-blue-400'
                  }
                `}
              >
                {choice.text}
              </Button>
            ))}
          </Stack>
        )}
      </DialogContent>
      {shouldShowAction && (
        <DialogActions className="bg-gray-800">
          <Button onClick={handleActionButton} className="text-blue-400">
            {actionLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GameDialog;

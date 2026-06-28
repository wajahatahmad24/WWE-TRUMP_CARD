import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import Card from './Card';
import { getScorePercentages, getRoundCompletionState } from './GameBoard';

test('renders the game title and turn indicator', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /wwe trump game/i })).toBeInTheDocument();
  expect(screen.getByText(/player 1's turn/i)).toBeInTheDocument();
});

test('calculates scoreboard widths from wins so the bars stay accurate', () => {
  expect(getScorePercentages(0, 0)).toEqual({ player1: 50, player2: 50 });
  expect(getScorePercentages(3, 1)).toEqual({ player1: 75, player2: 25 });
});

test('keeps the final round result visible briefly before ending the game', () => {
  expect(getRoundCompletionState(1, 1)).toEqual({ gameOver: false, pauseMs: 0 });
  expect(getRoundCompletionState(0, 1)).toEqual({ gameOver: true, pauseMs: 1000 });
});

test('shows the wrestler physique stats and omits rank', () => {
  const wrestler = {
    name: 'Test Wrestler',
    image: '/test.png',
    rank: 1,
    chest: 20,
    biceps: 15,
    height: 6.1,
    weight: 220,
  };

  render(
    <Card
      wrestler={wrestler}
      hidden={false}
      onCompare={jest.fn()}
      chosenStat={null}
      isPlayerOne={true}
    />
  );

  expect(screen.getByText('Rank')).toBeInTheDocument();
  expect(screen.getByText('Chest')).toBeInTheDocument();
  expect(screen.getByText('Biceps')).toBeInTheDocument();
  expect(screen.getByText('Height')).toBeInTheDocument();
  expect(screen.getByText('Weight')).toBeInTheDocument();
});

test('does not allow Player 1 to select stats from Player 2 cards', () => {
  const handleCompare = jest.fn();
  const wrestler = {
    name: 'Test Wrestler',
    image: '/test.png',
    rank: 1,
    chest: 20,
    biceps: 15,
    height: 6.1,
    weight: 220,
  };

  render(
    <Card
      wrestler={wrestler}
      hidden={false}
      onCompare={handleCompare}
      chosenStat={null}
      isPlayerOne={false}
    />
  );

  const stat = screen.getByText('Chest').closest('.stat');
  fireEvent.click(stat);

  expect(stat).not.toHaveClass('clickable');
  expect(handleCompare).not.toHaveBeenCalled();
});

import React, { useState, useEffect, useRef, useCallback } from "react";
import Card from "./Card";
import { wrestlers } from "./wrestlers";

export function getScorePercentages(player1Score, player2Score) {
  const total = player1Score + player2Score;

  if (total === 0) {
    return { player1: 50, player2: 50 };
  }

  return {
    player1: (player1Score / total) * 100,
    player2: (player2Score / total) * 100,
  };
}

export function canStartRound(revealOpponent, countdown, gameOver) {
  return !gameOver && !revealOpponent && countdown === null;
}

export function getRoundCompletionState(nextPlayer1DeckLength, nextPlayer2DeckLength) {
  const gameOver = nextPlayer1DeckLength === 0 || nextPlayer2DeckLength === 0;

  return {
    gameOver,
    pauseMs: gameOver ? 1000 : 0,
  };
}

export default function GameBoard() {
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [revealOpponent, setRevealOpponent] = useState(false);
  const [roundResult, setRoundResult] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [computerChoice, setComputerChoice] = useState(null);
  const [player1Choice, setPlayer1Choice] = useState(null);
  const roundInProgressRef = useRef(false);

  // Start or restart game
  const startNewGame = () => {
    const shuffled = [...wrestlers].sort(() => Math.random() - 0.5);
    const half = Math.floor(shuffled.length / 2);
    setPlayer1Deck(shuffled.slice(0, half));
    setPlayer2Deck(shuffled.slice(half));
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRevealOpponent(false);
    setRoundResult("");
    setGameOver(false);
    setCountdown(null);
    setWinner(null);
    setCurrentPlayer("player1");
    setComputerChoice(null);
    setPlayer1Choice(null);
    roundInProgressRef.current = false;
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Compare stat — ensure numeric comparisons
  const compareStat = useCallback((stat) => {
    if (roundInProgressRef.current) return;
    if (!canStartRound(revealOpponent, countdown, gameOver)) return;
    if (player1Deck.length === 0 || player2Deck.length === 0) return;
    if (player1Choice !== null) return;

    roundInProgressRef.current = true;
    setPlayer1Choice(stat);

    const p1Card = player1Deck[0];
    const p2Card = player2Deck[0];

    setRevealOpponent(true);

    // Coerce to numbers to avoid string/lexicographic comparison bugs
    const p1Value = Number(p1Card[stat]);
    const p2Value = Number(p2Card[stat]);

    let p1Wins = false;
    let p2Wins = false;

    if (stat === "rank") {
      // lower rank number wins
      if (p1Value < p2Value) p1Wins = true;
      else if (p2Value < p1Value) p2Wins = true;
    } else {
      // higher is better
      if (p1Value > p2Value) p1Wins = true;
      else if (p2Value > p1Value) p2Wins = true;
    }

    if (p1Wins) {
      setRoundResult("Player 1 Wins!");
      setPlayer1Score((s) => s + 1);
      setWinner("player1");
      setCurrentPlayer("player1");
    } else if (p2Wins) {
      setRoundResult("Player 2 Wins!");
      setPlayer2Score((s) => s + 1);
      setWinner("player2");
      setCurrentPlayer("player2");
    } else {
      setRoundResult("It's a Tie!");
      setWinner("tie");
      // keep currentPlayer unchanged on tie
    }

    // Start 5-second countdown before moving to next round
    let timeLeft = 5;
    setCountdown(timeLeft);

    const interval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);

        const nextPlayer1Deck = player1Deck.slice(1);
        const nextPlayer2Deck = player2Deck.slice(1);
        const completionState = getRoundCompletionState(nextPlayer1Deck.length, nextPlayer2Deck.length);

        setPlayer1Deck(nextPlayer1Deck);
        setPlayer2Deck(nextPlayer2Deck);

        if (completionState.gameOver) {
          setTimeout(() => {
            setGameOver(true);
            roundInProgressRef.current = false;
          }, completionState.pauseMs);
        } else {
          setRevealOpponent(false);
          setRoundResult("");
          setCountdown(null);
          setWinner(null);
          setComputerChoice(null);
          setPlayer1Choice(null);
          roundInProgressRef.current = false;
        }
      }
    }, 1000);
  }, [player1Deck, player2Deck, player1Choice, revealOpponent, countdown, gameOver]);

  // Computer plays strategically when it's player2's turn
  useEffect(() => {
    if (currentPlayer === "player2" && player2Deck.length > 0 && canStartRound(revealOpponent, countdown, gameOver)) {
      const timer = setTimeout(() => {
        const p2Card = player2Deck[0];
        const stats = ["rank", "chest", "biceps", "height", "weight"];

        // Choose best stat using numeric comparisons
        let bestStat = stats[0];
        let bestValue = Number(p2Card[bestStat]);

        stats.forEach((stat) => {
          const val = Number(p2Card[stat]);
          if (stat === "rank") {
            // lower is better for rank
            if (val < bestValue) {
              bestStat = stat;
              bestValue = val;
            }
          } else {
            if (val > bestValue) {
              bestStat = stat;
              bestValue = val;
            }
          }
        });

        setComputerChoice(bestStat);
        compareStat(bestStat);
      }, 900); // slight delay so UI updates feel natural

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, player2Deck, revealOpponent, countdown, gameOver, compareStat]);

  const scorePercentages = getScorePercentages(player1Score, player2Score);

  if (gameOver) {
    return (
      <div className="game-board game-over-card">
        <h1 className="text-3xl font-bold mb-4">Game Over</h1>
        <h2 className="text-xl">
          {player1Score > player2Score ? "Player 1 Wins the Game!" : "Player 2 Wins the Game!"}
        </h2>
        <p className="mt-4">
          Final Score: Player 1 ({player1Score}) - Player 2 ({player2Score})
        </p>
        <button onClick={startNewGame} className="restart-button">
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-turn-indicator">
        <h2
          className={currentPlayer === "player1" ? "turn-player turn-player-one" : "turn-player turn-player-two"}
        >
          {currentPlayer === "player1" ? "👉 Player 1's Turn" : "👉 Player 2's Turn"}
        </h2>
      </div>

      <div className="game-cards">
        {player1Deck.length > 0 && (
          <div className="game-card-slot">
            <Card
              wrestler={player1Deck[0]}
              hidden={false}
              onCompare={compareStat}
              highlight={winner === "player1"}
              isTurn={currentPlayer === "player1"}
              isPlayerOne={true}
              chosenStat={player1Choice}
            />
          </div>
        )}

        {player2Deck.length > 0 && (
          <div className="game-card-slot">
            <Card
              wrestler={player2Deck[0]}
              hidden={currentPlayer === "player2" ? false : !revealOpponent}
              onCompare={compareStat}
              highlight={winner === "player2"}
              isTurn={currentPlayer === "player2"}
              isPlayerOne={false}
              chosenStat={computerChoice}
            />
          </div>
        )}
      </div>

      <div className="game-status">
        {roundResult && <h2 className="round-result">{roundResult}</h2>}
        {countdown !== null && <p className="countdown">Next round in {countdown}...</p>}
      </div>

      <div className="deck-summary">
        <p>Player 1 Deck: {player1Deck.length} cards</p>
        <p>Player 2 Deck: {player2Deck.length} cards</p>
      </div>

      <div className="scoreboard">
        <div className="score-bar score-bar-blue">
          <div
            className="score-fill"
            style={{
              width: `${scorePercentages.player1}%`,
            }}
          >
            <span>Player 1 • {player1Score} win{player1Score === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="score-bar score-bar-red">
          <div
            className="score-fill score-fill-red"
            style={{
              width: `${scorePercentages.player2}%`,
            }}
          >
            <span>Player 2 • {player2Score} win{player2Score === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

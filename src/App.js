import React from "react";
import "./App.css";
import GameBoard from "./GameBoard";

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>WWE Trump Game</h1>
        <p>Choose the strongest stat and outplay your opponent.</p>
      </header>
      <GameBoard />
    </div>
  );
}

export default App;

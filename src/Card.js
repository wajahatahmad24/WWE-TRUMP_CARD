import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

const Card = ({ wrestler, hidden, glow, onCompare, chosenStat, isPlayerOne }) => {
  const stats = [
    { key: "rank", label: "Rank", value: wrestler.rank },
    { key: "chest", label: "Chest", value: `${wrestler.chest}"` },
    { key: "biceps", label: "Biceps", value: `${wrestler.biceps}"` },
    { key: "height", label: "Height", value: `${Number(wrestler.height).toFixed(2).replace(/\.0+$/, "").replace(/(\.\d)0+$/, "$1")} ft` },
    { key: "weight", label: "Weight", value: `${wrestler.weight} lbs` },
  ];

  return (
    <motion.div
      className={`card-container ${glow ? "winner-glow" : ""}`}
      initial={{ rotateY: hidden ? 180 : 0 }}
      animate={{ rotateY: hidden ? 180 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="card-face card-front">
        {hidden ? (
          <div className="hidden-card">?</div>
        ) : (
          <img src={wrestler.image} alt={wrestler.name} />
        )}
      </div>
      {!hidden && (
        <div className="card-info">
          <h3 className="card-name">{wrestler.name}</h3>
          <div className="stats-grid">
            {stats.map((stat) => {
              const isSelectable = !hidden && isPlayerOne && chosenStat === null;

              return (
                <div
                  key={stat.key}
                  role={isSelectable ? "button" : undefined}
                  tabIndex={isSelectable ? 0 : undefined}
                  onClick={() => {
                    if (isSelectable) {
                      onCompare(stat.key);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (isSelectable && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      onCompare(stat.key);
                    }
                  }}
                  className={`stat ${isSelectable ? "clickable" : ""} ${chosenStat === stat.key ? "selected-stat" : ""}`}
                >
                  <p className="label">{stat.label}</p>
                  <p className="value">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Card;

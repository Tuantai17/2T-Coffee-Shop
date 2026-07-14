import React, { useState, useEffect, useRef } from "react";
import GameHeader from "./GameHeader";
import CountdownOverlay from "./CountdownOverlay";

const CARD_SYMBOLS = ["🐻", "🐷", "🐶", "🐼", "🦊", "🐯", "🐸", "🐨", "🦁", "🐮", "🐭", "🐹", "🐰", "🐵", "🐔", "🐧", "🐦", "🐤"];

function buildDeck(gridSize = "4x4", customImages = []) {
  const parts = gridSize.split('x');
  const totalCards = (parseInt(parts[0]) || 4) * (parseInt(parts[1]) || 4);
  const numPairs = totalCards / 2;
  
  const pairs = [];
  for (let i = 0; i < numPairs; i++) {
    if (customImages && customImages.length > i && customImages[i]) {
      pairs.push({ type: 'image', value: customImages[i] });
    } else {
      pairs.push({ type: 'emoji', value: CARD_SYMBOLS[i % CARD_SYMBOLS.length] });
    }
  }

  return [...pairs, ...pairs]
    .map((content, index) => ({
      id: `card-${index}`,
      content,
      flipped: false,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5);
}

export default function MemoryMatchEngine({ game, gameState, setGameState, onFinishGame }) {
  const gameplayConfig = game?.gameplayConfig || {};
  const gridSize = gameplayConfig.gridSize || "4x4";
  const timerLimit = gameplayConfig.timer || 60;
  
  const [cards, setCards] = useState(() => buildDeck(gridSize, gameplayConfig.cardImages));
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [moves, setMoves] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timerLimit);
  const [busy, setBusy] = useState(false);
  const completedRef = useRef(false);

  // Initialize/Reset Game
  useEffect(() => {
    if (gameState === "READY" || gameState === "COUNTDOWN") {
      setCards(buildDeck(gridSize, gameplayConfig.cardImages));
      setFlippedIndexes([]);
      setMoves(0);
      setSecondsLeft(timerLimit);
      setBusy(false);
      completedRef.current = false;
    }
  }, [gameState, gridSize, gameplayConfig.cardImages, timerLimit]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (gameState === "PLAYING" && secondsLeft > 0) {
      timer = window.setInterval(() => {
        setSecondsLeft((current) => Math.max(0, current - 1));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [gameState, secondsLeft]);

  // Check Timeout
  useEffect(() => {
    if (gameState === "PLAYING" && secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      onFinishGame(false, moves, cards.filter(c => c.matched).length / 2, timerLimit); // Out of time
    }
  }, [gameState, secondsLeft, moves, cards, timerLimit, onFinishGame]);

  const flipCard = (index) => {
    if (busy || flippedIndexes.includes(index) || cards[index].matched || cards[index].flipped || gameState !== "PLAYING") {
      return;
    }

    const nextFlipped = [...flippedIndexes, index];
    setFlippedIndexes(nextFlipped);

    setCards((previous) => previous.map((c, i) => (i === index ? { ...c, flipped: true } : c)));

    if (nextFlipped.length === 2) {
      setBusy(true);
      const firstIndex = nextFlipped[0];
      const secondIndex = nextFlipped[1];
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      const isMatch = firstCard.content.value === secondCard.content.value;
      const currentMoves = moves + 1;
      setMoves(currentMoves);

      const currentlyMatchedPairs = cards.filter(c => c.matched).length / 2;
      const newMatchedPairs = isMatch ? currentlyMatchedPairs + 1 : currentlyMatchedPairs;
      const totalPairs = cards.length / 2;
      const allMatched = (newMatchedPairs === totalPairs);

      window.setTimeout(() => {
        setCards((previous) => {
          return previous.map((card, cardIndex) => {
            if (cardIndex !== firstIndex && cardIndex !== secondIndex) return card;
            if (isMatch) return { ...card, matched: true, flipped: true };
            return { ...card, flipped: false };
          });
        });
        
        setFlippedIndexes([]);
        setBusy(false);

        if (isMatch && allMatched && !completedRef.current) {
          completedRef.current = true;
          window.setTimeout(() => {
            onFinishGame(true, currentMoves, newMatchedPairs, timerLimit - secondsLeft);
          }, 400);
        }
      }, 700);
    }
  };

  const currentScore = Math.max(0, 1000 - moves * 12 - (timerLimit - secondsLeft) * 5);

  return (
    <div className="position-relative">
      <GameHeader game={game} moves={moves} timer={secondsLeft} score={gameState === "PLAYING" ? currentScore : 0} />
      
      <div className="mg-board-container shadow-sm">
        <CountdownOverlay 
          show={gameState === "COUNTDOWN"} 
          onComplete={() => setGameState("PLAYING")} 
        />
        
        <div className={`memory-grid memory-grid-${gridSize.replace('x', '')}`}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${card.flipped || card.matched ? "is-open" : ""} ${card.matched ? "is-matched" : ""}`}
              onClick={() => flipCard(index)}
              disabled={gameState !== "PLAYING"}
            >
              <div className="memory-card-content">
                {(card.flipped || card.matched) ? (
                  card.content.type === 'image' ? <img src={card.content.value} className="memory-card-img" alt="card" /> : <span>{card.content.value}</span>
                ) : <span>?</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

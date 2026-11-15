// Draw, discard and shuffle. The piles are plain arrays of card objects; the only rule that lives
// here is that an empty draw pile takes the discard pile back and shuffles it, so a long fight keeps
// going instead of stalling.
import { RULES } from './config.js';
import { state, nextUid } from './state.js';
import { defineCard } from './cards.js';

export function buildDeck(ids) {
  return ids.map((id) => {
    const card = defineCard(id);
    card.uid = nextUid();
    return card;
  });
}

export function shuffleIntoDraw(cards) {
  if (!cards.length) return 0;
  const shuffled = state.rng.shuffle(cards);
  state.drawPile = state.drawPile.concat(shuffled);
  return shuffled.length;
}

export function recycleDiscard() {
  if (!state.discardPile.length) return 0;
  const pile = state.discardPile;
  state.discardPile = [];
  return shuffleIntoDraw(pile);
}

export function drawOne() {
  if (!state.drawPile.length) {
    if (!recycleDiscard()) return null;
  }
  const card = state.drawPile.shift();
  if (!card) return null;
  state.hand.push(card);
  return card;
}

export function drawCards(count) {
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    if (state.hand.length >= RULES.handLimit) break;
    const card = drawOne();
    if (!card) break;
    drawn.push(card);
  }
  return drawn;
}

export function discardHand() {
  if (!state.hand.length) return 0;
  const count = state.hand.length;
  state.discardPile = state.discardPile.concat(state.hand);
  state.hand = [];
  return count;
}

export function discardCard(card) {
  state.discardPile.push(card);
}

export function addCardToDeck(id) {
  const card = defineCard(id);
  card.uid = nextUid();
  state.deck.push(card);
  state.discardPile.push(card);
  return card;
}

export function pileCounts() {
  return {
    draw: state.drawPile.length,
    discard: state.discardPile.length,
    hand: state.hand.length,
    deck: state.deck.length,
  };
}

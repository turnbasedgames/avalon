// Avalon Example
// TODO: evil players and merlin are the only players that should know who good and evil players are
// however this information is broadcasted to all players

const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

const Winner = Object.freeze({
  Good: 'good',
  Evil: 'evil',
});

// map from total number of players to the number of players required for each quest
const QUEST_PLAYERS_COUNT = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
};

// map from total number of players to the number of evil players
// we can deduce the number of good players to be the total minus the number of evil players
const EVIL_PLAYERS_COUNT = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
};

/**
 * shuffle will take an array and create a new shuffled array from the previous elements
 * @param {any[]} unshuffledArr is an array to be shuffled
 * @returns {any[]} the shuffled array
 */
function shuffle(unshuffledArr) {
  return unshuffledArr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

/**
 * onRoomStart
 * @returns {BoardGameResult}
 */
function onRoomStart() {
  return {
    // Most of the state is actually initialized when enough players join, this state serves
    state: {
      status: Status.PreGame,
    },
  };
}

/**
 * onPlayerJoin
 * @param {string} plr string, which represents the player id
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerJoin(plr, boardGame) {
  const { players, state } = boardGame;

  // determine if we should start the game
  if (players.length === 5) {
    const evilCount = EVIL_PLAYERS_COUNT[players.length];
    const goodCount = players.length - evilCount;

    // shuffle the players to randomize who is good and evil and who is merlin
    const shuffledPlayers = shuffle(players);
    state.playerToData = shuffledPlayers.reduce((playerToData, player, curInd) => ({
      ...playerToData,
      [player]: {
        good: curInd < goodCount,
        merlin: curInd === 0,
      },
    }), {});

    // we can get the current leader who does the team building as shuffledPlayers[indexOfLeader]
    state.indexOfLeader = 0;
    state.shuffledPlayers = shuffledPlayers;

    // the indexOfQuest provides a nice way of grabbing the total number of players needed
    // on the current quest by doing QUEST_PLAYERS_COUNT[players.length][indexOfQuest]
    // we can get the quest count by doing indexOfQuest + 1
    state.indexOfQuest = 0;
    state.status = Status.InGame;
    return {
      state,
      joinable: false, // in Avalon, new players cannot join mid game
    };
  }
  return {
    state,
    joinable: true,
  };
}

/**
 * onPlayerMove
 * @param {string} plr string, which represents the player id
 * @param {*} move json object, controlled the creator that represents the player's move
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerMove(plr, move, boardGame) {
  const { state, players } = boardGame;
  const { board, plrToMoveIndex } = state;
}

/**
 * onPlayerQuit
 * If a player quits in Avalon, then the game immediately ends with no winners.
 * @param {string} plr string, which represents the player id
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerQuit(plr, boardGame) {
  const { state } = boardGame;
  state.status = Status.EndGame;
  return { state, finished: true };
}

module.exports = {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};

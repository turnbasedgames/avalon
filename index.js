// Avalon Example

// TODO: WARNING evil players and merlin are the only players that should know who good and
// evil players are however this information is broadcasted to all players (we do not handle
// secret state)
// TODO: this should be easy to unit test

// TODO: shared constants from frontend and backend?
const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});

const Phase = Object.freeze({
  BuildTeam: 'buildTeam',
  VoteTeam: 'voteTeam',
  Quest: 'quest',
  AssassinateMerlin: 'assassinateMerlin',
});

const Action = Object.freeze({
  // only the leader can propose a team
  BuildTeam: 'buildTeam',

  // after a player has proposed a team to go on a quest, all players must vote whether they approve
  // or decline a quest
  VoteTeam: 'voteTeam',

  // action for failing or succeeded a quest
  // only evil players can fail a quest, but all players on the quest will need to respond
  // although we can assume what good players will respond (always success), we still wait
  // for their response to prevent "auto success" for a quest which can give away players
  Quest: 'quest',

  // this can only be done at the end of the game
  // evil players will discuss with eachother who they want they think merlin is
  // only the assassin player can kill merlin, and gets one chance at the end
  AssassinateMerlin: 'assassinateMerlin',
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
    state.playerToData = shuffle(players).reduce((playerToData, player, curInd) => ({
      ...playerToData,
      [player]: {
        good: curInd < goodCount,
        merlin: curInd === 0,
        assassin: curInd === goodCount,
      },
    }), {});

    // we can get the current leader who does the team building as shuffledPlayers[indexOfLeader]
    state.indexOfLeader = 0;
    // get a new shuffle of the players to get the order of leaders
    // we cannot reuse the previous shuffle because that would give away the identities
    // of the players (e.g. first leader will always be merlin, first n leaders are good, etc.)
    state.shuffledPlayers = shuffle(players);

    // the indexOfQuest provides a nice way of grabbing the total number of players needed
    // on the current quest by doing QUEST_PLAYERS_COUNT[players.length][indexOfQuest]
    // we can get the quest count by doing indexOfQuest + 1
    state.indexOfQuest = 0;

    // no successful quests at the start of the game
    state.successfulQuestCount = 0;

    // the starting phase is build team always where the first leader is trying to pick teams
    state.phase = Phase.BuildTeam;
    state.status = Status.InGame;
    return {
      state,
      joinable: false, // in Avalon, new players cannot join mid game
    };
  }

  // don't update any state when there are not enough players
  return {};
}

/**
 * onPlayerMove
 * @param {string} plr string, which represents the player id
 * @param {*} move json object, controlled the creator that represents the player's move
 * @param {BoardGame} currentGame
 * @returns {BoardGameResult}
 */
function onPlayerMove(plr, move, boardGame) {
  const { state } = boardGame;
  const {
    indexOfLeader, indexOfQuest, shuffledPlayers, phase, playerToData, suggestedTeam,
  } = state;
  const { action } = move;
  console.log('move made', { move, plr });

  // action must match the phase of the game, otherwise it implies a user is trying to make a move
  // for the wrong phase, which is non-sensical (e.g. voting on a player when there is an ongoing
  // quest)
  if (action === phase) {
    if (action === Action.BuildTeam) {
      if (shuffledPlayers[indexOfLeader] === plr) {
        const requiredPlayerCount = QUEST_PLAYERS_COUNT[shuffledPlayers.length][indexOfQuest];
        const { team } = move;
        const teamSet = new Set(team);
        if (teamSet.size === requiredPlayerCount) {
          if (Array.from(teamSet).every((teamPlayer) => shuffledPlayers.includes(teamPlayer))) {
            // this is a valid team to propose, we now need the team to go up for vote by players
            state.suggestedTeam = Array.from(teamSet);
            state.plrToVote = {}; // reset votes to empty for the voting phase
            state.phase = Phase.VoteTeam;
            return { state };
          }
          throw new Error(`Some players in the team are not valid players: ${team.join(', ')}. Current players are: ${shuffledPlayers.join(', ')}`);
        } else {
          throw new Error(`Suggested team is length: ${teamSet.size}. We need exactly ${requiredPlayerCount} players for this quest.`);
        }
      } else {
        throw new Error(`The current player is not leader: ${plr}. The current leader is: ${shuffledPlayers[indexOfLeader]}`);
      }
    } else if (action === Action.VoteTeam) {
      const { success } = move;
      state.plrToVote[plr] = Boolean(success);

      // all votes are in
      if (Object.keys(state.plrToVote) === shuffledPlayers.length) {
        // votes are majority if it is strictly greater than the length over 2
        // this works for both even and odd values:
        // 4 players / 2 = 2 (3 votes are needed for majority)
        // 5 players / 2 = 2.500...1 (works even with floating point errors, 3 votes are needed
        // for majority)
        const minRequired = shuffledPlayers.length / 2;
        const successCount = Object.values(state.plrToVote).filter((vote) => vote).length;

        // only start quest if majority votes for quest to move forward, otherwise need new team
        if (minRequired < successCount) {
          state.phase = Phase.Quest;
          state.plrToQuestVote = {}; // reset previous quest vote
        } else {
          state.indexOfLeader = (state.indexOfLeader + 1) % shuffledPlayers.length;
          state.phase = Phase.BuildTeam;
        }
      }
      return { state };
    } else if (action === Action.Quest) {
      if (!suggestedTeam.includes(plr)) {
        throw new Error(`Player is not in the team for the quest: ${plr}. Team is ${suggestedTeam}`);
      }

      // good players can never fail a mission
      const success = playerToData[plr].good || move.success;
      state.plrToQuestVote[plr] = success;

      // all quest votes are in
      const requiredPlayerCount = QUEST_PLAYERS_COUNT[shuffledPlayers.length][indexOfQuest];
      if (Object.keys(state.plrToQuestVote) === requiredPlayerCount) {
        if (Object.values(state.plrToQuestVote).every(Boolean)) {
          state.successfulQuestCount += 1;
        }
        state.indexOfQuest += 1;
        const failedQuestCount = state.indexOfQuest - state.successfulQuestCount;
        if (state.successfulQuestCount >= 3) {
          state.phase = Phase.AssassinateMerlin;
          return { state };
        } if (failedQuestCount >= 3) {
          state.phase = null;
          state.winner = Winner.Evil;
          return { state, finished: true };
        }
      }
    } else if (action === Action.AssassinateMerlin) {
      const { victim } = move;
      if (shuffledPlayers.includes(victim)) {
        state.phase = null;
        state.merlinGuess = victim;
        state.winner = playerToData[victim].merlin ? Winner.Evil : Winner.Good;
        return { state, finished: true };
      }
      throw new Error(`Player ${victim} is not in the list of players: ${shuffledPlayers.join(', ')}`);
    }
    throw new Error(`Invalid move action type: ${action}. Valid action types are: ${Object.values(Action).join(', ')}`);
  }
  throw new Error(`Action does not match phase: ${action}. The current phase: ${phase}`);
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

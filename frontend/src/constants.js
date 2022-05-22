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

export {
  Status,
  Phase,
  Action,
  Winner,
  QUEST_PLAYERS_COUNT,
  EVIL_PLAYERS_COUNT,
};

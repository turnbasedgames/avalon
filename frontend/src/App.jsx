// TODO: remove the eslint exception below
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Typography, Stack,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import client, { events } from '@urturn/client';
import theme from './theme';

import Player from './Player';
import Quest from './Quest';
import { Status } from './constants';

// TODO: how to tell what the current player is?
function App() {
  const [boardGame, setBoardGame] = useState({});
  useEffect(() => {
    console.log('client', client);
    events.on('stateChanged', setBoardGame);
    return () => {
      events.off('stateChanged', setBoardGame);
    };
  }, []);

  const { state = {}, players = [] } = boardGame;
  const {
    playerToData, shuffledPlayers = [], status, indexOfLeader,
    successfulQuestCount, indexOfQuest, plrToQuestVote = {},
  } = state;
  const isPreGame = status === Status.PreGame;

  let generalStatus;
  if (isPreGame) {
    generalStatus = `Waiting for enough players to join (current players: ${players.join(', ')}) ...`;
  }

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100%">
        <Typography variant="h3" textAlign="center" color="text.primary">Avalon</Typography>
        <Typography textAlign="center" color="text.primary">{generalStatus}</Typography>
        {!isPreGame && (
          <Stack alignItems="center">
            <Stack margin={2} spacing={1} direction="row" justifyContent="center" sx={{ flexWrap: 'wrap' }}>
              {shuffledPlayers.map((player) => (
                <Player
                  leader={shuffledPlayers[indexOfLeader] === player}
                  player={player}
                  data={playerToData[player]}
                />
              ))}
            </Stack>
            <Quest
              successfulQuestCount={successfulQuestCount}
              indexOfQuest={indexOfQuest}
              plrToQuestVote={plrToQuestVote}
            />
            <Stack>
              <Typography>
                Actions
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardHeader, CardContent, Stack,
} from '@mui/material';
import { grey, red, green } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { GiCrossedSwords } from 'react-icons/gi';

function Player({
  player,
  data,
  showGood,
  showCharacter,
  leader,
  teamVote,
  onQuest,
}) {
  let charName = '';
  if (data.merlin) {
    charName = 'Merlin';
  } else if (data.assassin) {
    charName = 'Assassin';
  }

  let color = red;
  if (!showGood) {
    color = grey;
  } else if (data.good) {
    color = green;
  }

  return (
    <Card sx={{ backgroundColor: color[900] }}>
      <Stack height="100%" justifyContent="space-between">
        <CardHeader
          title={`${player}${showCharacter ? `-${charName}` : ''}`}
          subheader={leader && 'leader'}
        />
        <CardContent>
          {onQuest && <GiCrossedSwords />}
          {teamVote !== undefined && (teamVote
            ? <CheckCircleIcon color="success" />
            : <CancelIcon color="error" />)}
        </CardContent>
      </Stack>
    </Card>
  );
}

Player.defaultProps = {
  showGood: false,
  showCharacter: false,
  leader: false,
  teamVote: undefined,
  onQuest: false,
};

Player.propTypes = {
  player: PropTypes.string.isRequired,
  data: PropTypes.shape({
    good: PropTypes.bool,
    merlin: PropTypes.bool,
    assassin: PropTypes.bool,
  }).isRequired,
  showGood: PropTypes.bool,
  showCharacter: PropTypes.bool,
  leader: PropTypes.bool,
  teamVote: PropTypes.bool,
  onQuest: PropTypes.bool,
};

export default Player;

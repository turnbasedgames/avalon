import React from 'react';
import { Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const TOTAL_QUEST_COUNT = 5;

function Quest({ successfulQuestCount, indexOfQuest, plrToQuestVote }) {
  const failedQuestCount = indexOfQuest - successfulQuestCount;
  const questsLeftCount = TOTAL_QUEST_COUNT - indexOfQuest;

  let lastQuestMessage = '';
  if (indexOfQuest > 0) {
    const failureCount = Object.values(plrToQuestVote).reduce((count, questVote) => {
      if (questVote) {
        return count + 1;
      }
      return count;
    }, 0);
    if (failureCount === 0) {
      lastQuestMessage = 'Last Quest Was Successful!';
    } else {
      lastQuestMessage = `Last Quest had ${failureCount}`;
    }
  }
  return (
    <Stack>
      <Typography color="text.primary">
        {`${failedQuestCount} Failed Quests`}
      </Typography>
      <Typography color="text.primary">
        {`${successfulQuestCount} Successful Quests`}
      </Typography>
      <Typography color="text.primary">
        {`${questsLeftCount} Unfinished Quests`}
      </Typography>
      <Typography color="text.primary">
        {lastQuestMessage}
      </Typography>
    </Stack>
  );
}

Quest.propTypes = {
  successfulQuestCount: PropTypes.number.isRequired,
  indexOfQuest: PropTypes.number.isRequired,

  // object with player as keys and boolean as values (shape is the best option here,
  // but is a misnomer)
  plrToQuestVote: PropTypes.shape({}).isRequired,
};

export default Quest;

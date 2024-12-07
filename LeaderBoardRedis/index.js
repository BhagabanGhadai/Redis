const express = require('express');
const app = express();
const PORT = 3000;
const redis = require('./redis')
app.use(express.json());
redis.once('connect', () => {
    console.log('Connected to Redis');
})
const leaderboardKey = 'game_leaderboard';

app.post('/update', async (req, res) => {
  const { player, score } = req.body;
  await addOrUpdateScore(leaderboardKey, player, score);
  res.status(200).send(`Score for player ${player} updated to ${score}`);
});

app.get('/leaderboard', async (req, res) => {
  const { topN } = req.query;
  const players = await getTopPlayers(leaderboardKey, parseInt(topN, 10));
  res.status(200).json(players);
});

app.get('/player/:player', async (req, res) => {
  const { player } = req.params;
  const data = await getPlayerRankAndScore(leaderboardKey, player);
  res.status(200).json(data);
});

const addOrUpdateScore = async (leaderboardKey, player, score) => {
    await redis.zadd(leaderboardKey, score, player);
    console.log(`Score for player ${player} updated to ${score}`);
  };

  const getTopPlayers = async (leaderboardKey, topN) => {
    const players = await redis.zrevrange(leaderboardKey, 0, topN - 1, 'WITHSCORES');
    console.log(`Top ${topN} players: ${players}`);
    return players;
  };
  const getPlayerRankAndScore = async (leaderboardKey, player) => {
    const rank = await redis.zrevrank(leaderboardKey, player);
    const score = await redis.zscore(leaderboardKey, player);
    console.log(`Player ${player} is ranked ${rank + 1} with a score of ${score}`);
    return { rank: rank + 1, score };
  };
    
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

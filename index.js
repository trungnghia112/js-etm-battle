let json_monsters = require('./data/monsters.json');
let json_emonsters = require('./data/emonsters.json');
let json_skills = require('./data/skills.json');
let _ = require('lodash');

import { chooseEnemyMonster } from './libs/gameLogic.js';
console.log(json_emonsters[0]);
let listMonsters = [];
let listTurns = [];
let bfaction = [];

listMonsters = _.orderBy(
  _.compact([...json_monsters, ...json_emonsters]),
  ['ability.stats.spd', 'totalPoint'],
  ['desc', 'desc']
).map((v) => {
  return {
    _id: v._id,
    type: v.type,
    id: v.id,
    name: v.name,
    position: v.position,
    currenthp: v.ability.stats.hp,
    hit: [],
    hprecovery: [],
    fury: [0],
    shield: [],
    buff: [],
    debuff: [],
  };
});
// console.log('listMonsters:', JSON.stringify(listMonsters));
bfaction = [...listMonsters];

listMonsters.forEach((m) => {
  let gameround = '{{uuid4}}';
  const bfaction_monsters = [...bfaction];
  const action_monsters_skills_targets = [];
  let target = chooseEnemyMonster(
    m.position,
    m.type === 'enemy' ? json_monsters : json_emonsters
  );
  console.log('target:', target);
  action_monsters_skills_targets.push({
    
  })
});

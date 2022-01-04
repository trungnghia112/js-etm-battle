let json_monsters = require('./data/monsters.json');
let json_emonsters = require('./data/emonsters.json');
let json_skills = require('./data/skills.json');
let _ = require('lodash');
const localDb = require('./libs/db.js');
let db = new localDb.Database();

import {
  monsterHP,
  chooseEnemyMonster,
  calculatingDamageNormalAttack,
} from './libs/gameLogic.js';
// console.log(json_emonsters[0]);
let listMonsters = [];
let listTurns = [];
let bfaction = [];

listMonsters = _.orderBy(
  _.compact([...json_monsters, ...json_emonsters]),
  ['ability.stats.spd', 'totalPoint'],
  ['desc', 'desc']
).map((v) => {
  return {
    // _id: v._id,
    // type: v.type,
    // id: v.id,
    // name: v.name,
    ...v,
    currenthp: monsterHP(v),
    hit: [],
    hprecovery: [],
    fury: [0],
    shield: [],
    buff: [],
    debuff: [],
  };
});
// console.log('listMonsters:', JSON.stringify(listMonsters));
// console.log('listMonsters:', listMonsters);
bfaction = [...listMonsters];

listMonsters.forEach((monsterAttack) => {
  let gameround = db.makeid();
  const bfaction_monsters = [...bfaction];
  const action_monsters_skills_targets = [];
  let monsterDefenseList = chooseEnemyMonster(
    monsterAttack.position,
    monsterAttack.type === 'enemy' ? json_monsters : json_emonsters
  );

  monsterDefenseList.forEach((md) => {
    let monsterDefense = listMonsters.find((lm) => lm._id === md._id);
    const damageNormal = calculatingDamageNormalAttack(
      monsterAttack,
      monsterDefense
    );
    monsterDefense = {
      ...monsterDefense,
      hit: [damageNormal],
      fury: [
        monsterDefense.fury[0] + 25 > 100 ? 0 : monsterDefense.fury[0] + 25,
      ],
      currenthp:
        monsterDefense.currenthp - damageNormal > 0
          ? monsterDefense.currenthp - damageNormal
          : 0,
    };

    action_monsters_skills_targets.push(monsterDefense);
  });

  const monster_with_skills = {
    _id: monsterAttack._id,
    type: monsterAttack.type,
    id: monsterAttack.id,
    name: monsterAttack.name,
    skills: [
      {
        skill: 0,
        targets: action_monsters_skills_targets,
      },
    ],
  };

  console.log('monster_with_skills:', monster_with_skills);
});

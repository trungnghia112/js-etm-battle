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
let round = 0;

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

function makeTurn() {
  let listTurns = [];
  let bfaction = [...listMonsters];

  listMonsters.forEach((monsterAttack) => {
    let gameround = db.makeid();
    let listOrder = listMonsters.map((m) => m._id);
    listOrder.unshift(monsterAttack._id);
    listOrder = _.uniq(listOrder);

    const bfaction_monsters = [...bfaction];
    const action_monsters_skills_targets = [];
    let monsterDefenseList = chooseEnemyMonster(
      monsterAttack.position,
      monsterAttack.type === 'enemy' ? json_monsters : json_emonsters
    );

    monsterDefenseList.forEach((md) => {
      let monsterDefense = listMonsters.find((m) => m._id === md._id);
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
    const action_monsters = [monster_with_skills];

    let currentMonster = listMonsters.find((m) => m._id === monsterAttack._id);
    currentMonster = {
      ...currentMonster,
      fury: [
        currentMonster.fury[0] + 25 > 100 ? 0 : currentMonster.fury[0] + 25,
      ],
    };
    const afaction_monsters = bfaction_monsters.map((m) => {
      const eM = action_monsters_skills_targets.find(
        (afm) => afm._id === m._id
      );
      return currentMonster._id === m._id ? currentMonster : eM ? eM : m;
    });

    const turn = {
      data: {
        gameround,
        listOrder,
        bfaction: {
          monsters: bfaction_monsters,
        },
        action: {
          monsters: action_monsters,
        },
        afaction: {
          monsters: afaction_monsters,
        },
      },
    };
    // db.create(turn.data);
    listTurns.push(turn);

    listMonsters = listMonsters.map((m) => {
      const monster = afaction_monsters.find((afm) => afm._id === m._id);
      return monster ? monster : m;
    });
  });

  round = round + 1;
  const monster = listMonsters.find((v) => v.currenthp > 0);
  console.log('round:', round);
  console.log('listTurns:', listTurns);
  if (monster && round < 10) {
    makeTurn();
  }
}
makeTurn();

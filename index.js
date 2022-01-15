// let json_monsters = require('./data/monsters.json');
// let json_emonsters = require('./data/emonsters.json');
// let json_skills = require('./data/skills.json');

const dataJson = require('./data/jsonviewer.json');
let myMonsters = dataJson.data.monsters;
let enemyMonsters = dataJson.data.eMonsters;

let _ = require('lodash');
const localDb = require('./libs/db.js');
let db = new localDb.Database();
function genarateGameRound() {
  return db.makeid();
}

import {
  monsterHP,
  chooseEnemyMonster,
  calculatingDamageNormalAttack,
} from './libs/gameLogic.js';
// console.log(json_emonsters[0]);
let listMonsters = [];
let round = 0;
let monstersCheck = [];
let monster_count = 0;
let eMonster_count = 0;

listMonsters = _.orderBy(
  _.compact([...myMonsters, ...enemyMonsters]),
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
// console.log('listMonsters:', listMonsters);

async function makeTurn() {
  let listTurns = [];
  let turnIndex = 0;
  for (const monsterAttack of listMonsters) {
    console.log('-------', `round-${round} turn-${turnIndex}`, '-------');
    let bfaction = [...listMonsters];
    let gameround = genarateGameRound();
    let listOrder = listMonsters.map((m) => m._id);
    listOrder.unshift(monsterAttack._id);
    listOrder = _.uniq(listOrder);

    const bfaction_monsters = [...bfaction];
    const action_monsters_skills_targets = [];
    let monsterDefenseList = chooseEnemyMonster(
      monsterAttack.position,
      monsterAttack.type === 'enemy' ? myMonsters : enemyMonsters
    );

    monsterDefenseList.forEach((md) => {
      let monsterDefense = listMonsters.find((m) => m._id === md._id);
      if (monsterDefense && monsterDefense.currenthp > 0) {
        let damageNormal = calculatingDamageNormalAttack(
          monsterAttack,
          monsterDefense
        );
        damageNormal = Math.round(damageNormal); // round damage
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
      }
    });
    if (action_monsters_skills_targets.length === 0) {
      return;
    }

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
    // console.log('monster_with_skills:', monster_with_skills);
    const action_monsters = [monster_with_skills];

    let currentMonster = listMonsters.find((m) => m._id === monsterAttack._id);
    currentMonster = {
      ...currentMonster,
      fury: [
        currentMonster.fury[0] + 25 > 100 ? 0 : currentMonster.fury[0] + 25,
      ],
    };
    // console.log('currentMonster:', currentMonster);

    const afaction_monsters = bfaction_monsters.map((m) => {
      const eM = action_monsters_skills_targets.find(
        (afm) => afm._id === m._id
      );
      return currentMonster._id === m._id
        ? currentMonster
        : eM
        ? {
            ...eM,
            hit: [], // restore hit after hitted
          }
        : m;
    });
    // console.log('afaction_monsters:', afaction_monsters);

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
    // console.log('turn:', turn);
    // await db.create(turn.data);

    let response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'new_title',
        body: 'new_body',
        userId: 'userid',
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    response = await response.json();
    // console.log(round, 'response:', response);

    listTurns.push(turn);

    listMonsters = listMonsters.map((m) => {
      const monster = afaction_monsters.find((afm) => afm._id === m._id);
      return monster ? { ...monster } : { ...m };
    });

    console.log('bfaction_monsters:', bfaction_monsters);
    console.log('action_monsters:', action_monsters);
    console.log('afaction_monsters:', afaction_monsters);

    // console.log('listMonsters:', listMonsters);

    turnIndex = turnIndex + 1;
    listMonsters = listMonsters.filter((v) => v.currenthp > 0);
  }

  // reset turn turnIndex
  turnIndex = 0;
  round = round + 1;
  // const monster = listMonsters.find((v) => v.currenthp > 0);

  monstersCheck = _.groupBy(listMonsters, 'type');
  // console.log('monstersCheck:', monstersCheck);
  eMonster_count = monstersCheck.enemy ? monstersCheck.enemy.length : 0;
  monster_count = monstersCheck.my ? monstersCheck.my.length : 0;

  // console.log('round:', round);
  // console.log('eMonster_count:', eMonster_count);
  // console.log('monster_count:', monster_count);
  // console.log('-------------------');

  if (round < 10 && monster_count > 0 && eMonster_count > 0) {
    await makeTurn();
  }
}
async function start() {
  await makeTurn();
  console.log(monster_count > eMonster_count ? 'you win' : 'you lose');
}
start();

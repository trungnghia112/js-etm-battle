// let json_monsters = require('./data/monsters.json');
// let json_emonsters = require('./data/emonsters.json');
// let json_skills = require('./data/skills.json');
let _ = require('lodash');
const localDb = require('./libs/db.js');
const dataJson = require('./data/jsonviewer.json');
let myMonsters = _.clone(dataJson.data.monsters);
let enemyMonsters = _.clone(dataJson.data.eMonsters);
import {
  monsterHP,
  chooseEnemyMonster as libChooseEnemyMonster,
  calculatingDamageNormalAttack as libCalculatingDamageNormalAttack,
} from './libs/gameLogic.js';

let db = new localDb.Database();
class MonsterClassBase {
  constructor(brand) {
    this.carname = brand;
  }
  present() {
    return 'I have a ' + this.carname;
  }
}

class Model extends MonsterClassBase {
  constructor(brand, mod) {
    super(brand);
    this.model = mod;
  }
  generateGameRound() {
    return this.present() + ', it is a ' + this.model;
  }
  chooseEnemyMonster(position, monsterArr_type) {
    return libChooseEnemyMonster(position, monsterArr_type);
  }
  calculatingDamageNormalAttack(attack, defense) {
    return libCalculatingDamageNormalAttack(attack, defense);
  }
  async findOneAndUpdate(a, b, c) {
    // return fetch('https://jsonplaceholder.typicode.com/posts', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     title: 'new_title',
    //     body: 'new_body',
    //     userId: 'userid',
    //   }),
    //   headers: {
    //     'Content-type': 'application/json; charset=UTF-8',
    //   },
    // });
    // return response.json();
  }
}
let battleHelper = new Model('my', 'enemy');
let gameLogicHelper = new Model('my', 'enemy');
let BattleAction = new Model('my', 'enemy');
BattleAction;

// console.log(json_emonsters[0]);
let battleId = 123;
let listMonsters = [];
let round = 0;
let monstersCheck = [];
let monster_count = 0;
let eMonster_count = 0;
let gameturn = 0;
let rounds = [];

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

async function makeTurn() {
  let listTurns = [];
  let turnIndex = 0;
  for (const monsterAttack of listMonsters) {
    console.log('-------', `round-${round} turn-${turnIndex}`, '-------');
    let bfaction = [...listMonsters];
    let gameround = battleHelper.generateGameRound(battleId, round);
    let listOrder = listMonsters.map((m) => m._id);
    listOrder.unshift(monsterAttack._id);
    listOrder = _.uniq(listOrder);

    const bfaction_monsters = [...bfaction];
    const action_monsters_skills_targets = [];

    let monsterDefenseList = battleHelper.chooseEnemyMonster(
      monsterAttack.position,
      monsterAttack.type === 'enemy' ? myMonsters : enemyMonsters
    );
    
    if (monsterDefenseList.length <= 0) {
        continue;
    }
    console.log('monsterDefenseList:', monsterDefenseList);

    monsterDefenseList.forEach((md) => {
      let monsterDefense = listMonsters.find((m) => m._id === md._id);
      if (monsterDefense) {
        let damageNormal = gameLogicHelper.calculatingDamageNormalAttack(
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

    if (!currentMonster) {
      continue;
    }

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
        round,
        battleId,
        gameturn,
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

    await BattleAction.findOneAndUpdate(
      {
        gameturn: gameturn,
        round: round,
      },
      turn.data,
      {
        new: true,
        upsert: true,
      }
    );

    listTurns.push(turn);

    listMonsters = listMonsters
      .map((m) => {
        const monster = afaction_monsters.find((afm) => afm._id === m._id);
        if (monster && monster.currenthp === 0) {
          if (monster.type === 'my') {
              let indexM = -1;
              const myMonstersKeys = Object.keys(myMonsters);
              for (let k of myMonstersKeys) {
                  const v = myMonsters[k];
                  if (!v) {
                      continue;
                  }
                  if (v._id === monster._id) {
                      indexM = k;
                      break;
                  }
              }

              if (indexM !== -1) {
                  myMonsters[indexM] = null;
              }
          } else {
              let indexM = -1;
              const enemyMonstersKeys = Object.keys(enemyMonsters);
              for (let k of enemyMonstersKeys) {
                  const v = enemyMonsters[k];
                  if (!v) {
                      continue;
                  }
                  if (v._id === monster._id) {
                      indexM = k;
                      break;
                  }
              }

              if (indexM) {
                  enemyMonsters[indexM] = null;
              }
          }
        }
        return monster ? { ...monster } : { ...m };
      })
      .filter((v) => v.currenthp > 0);

    // console.log('bfaction_monsters:', bfaction_monsters);
    // console.log('action_monsters:', action_monsters);
    // console.log('afaction_monsters:', afaction_monsters);
    // console.log('listMonsters:', listMonsters);

    turnIndex = turnIndex + 1;
    gameturn++;
  }

  // reset turn turnIndex
  turnIndex = 0;
  round = round + 1;
  rounds.push({
    turns: listTurns,
  });
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

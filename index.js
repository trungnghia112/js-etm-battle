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

import { skillEffectMonsters as lib_skillEffectMonsters } from './libs/skill.js';

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
  chooseDefenseMonsters(position, monsterArr_type) {
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

  skillEffectMonsters() {
    return lib_skillEffectMonsters(attack, defense);
  }
}
let battleHelper = new Model('my', 'enemy');
let gameLogicHelper = new Model('my', 'enemy');
let BattleAction = new Model('my', 'enemy');
let skillHelper = new Model('my', 'enemy');

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
    // kiểm tra xem monster hoặc enemyMonster còn sống hay không, nếu chết thì dừng cuộc chơi
    if (!_.compact(myMonsters).length || !_.compact(enemyMonsters).length) {
      continue;
    }

    console.log('-------', `round-${round} turn-${turnIndex}`, '-------');
    let bfaction = [...listMonsters];
    let gameround = battleHelper.generateGameRound(battleId, round);
    let listOrder = listMonsters.map((m) => m._id);

    const bfaction_monsters = [...bfaction];
    const action_monsters_skills_targets = [];

    let monsterTargetList = battleHelper.chooseDefenseMonsters(
      monsterAttack.position,
      monsterAttack.type === 'enemy' ? myMonsters : enemyMonsters
    );

    monsterTargetList.forEach((md) => {
      let monsterTarget = listMonsters.find((m) => m._id === md._id);
      if (monsterTarget) {
        let damageNormal = gameLogicHelper.calculatingDamageNormalAttack(
          monsterAttack,
          monsterTarget
        );
        damageNormal = Math.round(damageNormal); // round damage
        monsterTarget = {
          ...monsterTarget,
          hit: [damageNormal],
          fury: [
            monsterTarget.fury[0] + 25 > 100 ? 100 : monsterTarget.fury[0] + 25,
          ],
          currenthp:
            monsterTarget.currenthp - damageNormal > 0
              ? monsterTarget.currenthp - damageNormal
              : 0,
        };

        // kiểm tra nếu con monsterTarget nó thuộc list monster nào
        // nếu currenthp = 0 thì chuyển index của nó về bằng null
        // tại vì hàm chooseDefenseMonsters chọn theo vị trí
        if (monsterTarget.currenthp <= 0) {
          if (monsterTarget.type === 'my') {
            let mtIndex = myMonsters.findIndex(
              (m) => !_.isNull(m) && m._id === monsterTarget._id
            );
            myMonsters[mtIndex] = null;
          } else {
            let mtIndex = enemyMonsters.findIndex(
              (m) => !_.isNull(m) && m._id === monsterTarget._id
            );
            enemyMonsters[mtIndex] = null;
          }
        }

        console.log(
          `con [${monsterAttack.type}] [${monsterAttack.id}-${monsterAttack.ability.element}-${monsterAttack.ability.attackType}-${monsterAttack.ability.rank}] với fury [${monsterAttack.fury}], hp [${monsterAttack.currenthp}] sẽ đánh con `,
          `[${monsterTarget.type}] [${monsterTarget.id}-${monsterTarget.ability.element}-${monsterTarget.ability.attackType}-${monsterTarget.ability.rank}] với fury [${monsterTarget.fury}], hp [${monsterTarget.currenthp}]`
        );

        action_monsters_skills_targets.push(monsterTarget);
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
      turnIndex++;
      continue;
    }

    currentMonster = {
      ...currentMonster,
      fury: [
        currentMonster.fury[0] + 25 > 100 ? 0 : currentMonster.fury[0] + 25,
      ],
    };

    let afaction_monsters = bfaction_monsters
      .map((m) => {
        const eM = action_monsters_skills_targets.find(
          (afm) => afm._id === m._id
        );
        const result =
          currentMonster._id === m._id
            ? {
                ...currentMonster,
              }
            : eM
            ? {
                ...eM,
              }
            : m;
        return {
          ...result,
          hit: [], // restore hit after hitted
          hprecovery: [], // restore hit after hitted
        };
      })
      .filter((v) => v.currenthp > 0);

    console.log('afaction_monsters:', afaction_monsters);

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

    listMonsters = afaction_monsters.filter((m) => m._id !== monsterAttack._id);
    listMonsters.push(monsterAttack);

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
  let result = 'lose';
  // console.log(monster_count, eMonster_count);
  if (eMonster_count <= 0) {
    result = 'win';
  }
  console.log(`you ${result}`);
}
start();

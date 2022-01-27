const _ = require('lodash');
import { chooseEnemyMonster as libChooseEnemyMonster } from './gameLogic.js';
class Model {
  chooseEnemyMonster(position, monsterArr_type) {
    return libChooseEnemyMonster(position, monsterArr_type);
  }
}
let battleHelper = new Model('my', 'enemy');

function skillEffectMonsters(skill, currentMonster, listMonsters) {
  // Danh sách monster địch
  let defenseMonsters = [];

  /*
   * Danh sách monster bị chỉ điểm
   * - phe mình hồi máu/tăng atk,...
   * - phe địch bị trừ máu,...
   */
  let monsterTargetList = [];

  // Danh sách monster bị skill gây hiệu ứng
  let monsterSkillEffectList = [];

  switch (skill.id) {
    case 1:
      // Launches a fireball at the opponent in front, dealing 237% physical damage to the opponent
      let skillAtkIncrease = 2.37;

      defenseMonsters = listMonsters.filter(
        (mf) => mf.type !== currentMonster.type
      );
      monsterTargetList = battleHelper.chooseDefenseMonsters(
        currentMonster.position,
        defenseMonsters,
        0
      );
      monsterSkillEffectList = monsterTargetList.map((m) => {
        return {
          key: m._id,
          value: [
            {
              _id: m._id,
              fury: 0,
              hit: skillAtkIncrease,
              hprecovery: 0,
              shield: 0,
              buff: [],
              debuff: [],
            },
          ],
        };
      });
      break;
    case 2:
      // Tấn công hàng trước của đối thủ, gây 135% sát thương vật lý và gây hiệu ứng Burn trong 3 lượt
      // Attacks opponent's front row, dealing 135% physical damage and burning effect for 3 turns, burns 2% of enemy's hp each 3 round.
      let skillAtk = 1.35;
      let skillHP = 0.02;

      defenseMonsters = listMonsters.filter(
        (mf) => mf.type !== currentMonster.type
      );
      monsterTargetList = battleHelper.chooseDefenseMonsters(
        currentMonster.position,
        defenseMonsters,
        0
      );
      monsterSkillEffectList = monsterTargetList.map((m) => {
        return {
          key: m._id,
          value: {
            action: [
              {
                _id: m._id,
                fury: 0,
                hit: skillAtk,
                hprecovery: 0,
                shield: 0,
                buff: [],
                debuff: [],
              },
            ],
            afaction: [
              {
                _id: m._id,
                fury: 0,
                hit: skillHP,
                hprecovery: 0,
                shield: 0,
                buff: [],
                debuff: [1020],
              },
              {
                _id: m._id,
                fury: 0,
                hit: skillHP,
                hprecovery: 0,
                shield: 0,
                buff: [],
                debuff: [1020],
              },
              {
                _id: m._id,
                fury: 0,
                hit: skillHP,
                hprecovery: 0,
                shield: 0,
                buff: [],
                debuff: [1020],
              },
            ],
          },
        };
      });

      break;
    case 5:
      // Increases rage for all our factions by 40 and heals all members for 10% of the buffed champion's HP
      let skillFuryIncrease = 40;
      let skillHPIncrease = 0.1; // *10%

      monsterTargetList = listMonsters.filter(
        (mf) => mf.type === currentMonster.type
      );
      monsterSkillEffectList = monsterTargetList.map((m) => {
        return {
          key: m._id,
          value: [
            {
              _id: m._id,
              fury: m._id === currentMonster._id ? 0 : skillFuryIncrease,
              hit: 0,
              hprecovery: skillHPIncrease,
              shield: 0,
              buff: [],
              debuff: [],
            },
          ],
        };
      });
      break;
  }

  return {
    monsterTargetList,
    monsterSkillEffectList,
    skillId: skill.id,
  };
}

export { skillEffectMonsters };

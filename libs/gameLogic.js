function chooseEnemyMonster(position, eMonsters, skill) {
  let monsters = [],
    ePositions = [];
  if (skill) {
    for (let ePos = 0; ePos < 9; ePos++) {
      if (eMonsters[ePos] != null) {
        monsters.push(eMonsters[ePos]);
      }
    }
  } else {
    switch (position) {
      case 1:
      case 4:
      case 7:
        for (let ePos = 0; ePos < 9; ePos++) {
          if (eMonsters[ePos] != null) {
            monsters.push(eMonsters[ePos]);
            break;
          }
        }
        break;
      case 2:
      case 5:
      case 8:
        ePositions = [1, 0, 2, 3, 4, 5, 6, 7, 8];
        ePositions.every((ePos) => {
          if (eMonsters[ePos] != null) {
            monsters.push(eMonsters[ePos]);
            return false;
          }
          return true;
        });
        break;
      case 3:
      case 6:
      case 9:
        ePositions = [2, 0, 1, 3, 4, 5, 6, 7, 8];
        ePositions.every((ePos) => {
          if (eMonsters[ePos] != null) {
            monsters.push(eMonsters[ePos]);
            return false;
          }
          return true;
        });
        break;
    }
  }

  return monsters;
}

function elementPoint(monster, eMonster) {
  let operation;
  switch (monster.ability.element) {
    case 'Fire':
      switch (eMonster.ability.element) {
        case 'Fire':
          operation = 1;
          break;
        case 'Water':
          operation = 0.5;
          break;
        case 'Electric':
          operation = 1.5;
          break;
        case 'Plant':
          operation = 2;
          break;
        case 'Earth':
          operation = 0.8;
          break;
      }
      break;
    case 'Water':
      switch (eMonster.ability.element) {
        case 'Fire':
          operation = 2;
          break;
        case 'Water':
          operation = 1;
          break;
        case 'Electric':
          operation = 0.5;
          break;
        case 'Plant':
          operation = 0.8;
          break;
        case 'Earth':
          operation = 1.5;
          break;
      }
      break;
    case 'Electric':
      switch (eMonster.ability.element) {
        case 'Fire':
          operation = 0.8;
          break;
        case 'Water':
          operation = 2;
          break;
        case 'Electric':
          operation = 1;
          break;
        case 'Plant':
          operation = 1.5;
          break;
        case 'Earth':
          operation = 0.5;
          break;
      }
      break;
    case 'Plant':
      switch (eMonster.ability.element) {
        case 'Fire':
          operation = 0.5;
          break;
        case 'Water':
          operation = 1.5;
          break;
        case 'Electric':
          operation = 0.8;
          break;
        case 'Plant':
          operation = 1;
          break;
        case 'Earth':
          operation = 2;
          break;
      }
      break;
    case 'Earth':
      switch (eMonster.ability.element) {
        case 'Fire':
          operation = 1.5;
          break;
        case 'Water':
          operation = 0.8;
          break;
        case 'Electric':
          operation = 2;
          break;
        case 'Plant':
          operation = 0.5;
          break;
        case 'Earth':
          operation = 1;
          break;
      }
      break;
    default:
      operation = 0;
      break;
  }

  return operation;
}

function monsterTotalPoint(monster) {
  return (
    monster.ability.stats.atk +
    monster.ability.stats.def +
    monster.ability.stats.matk +
    monster.ability.stats.mdef +
    monster.ability.stats.spd +
    monster.ability.stats.hp
  );
}

function calculatingDamageNormalAttack(monster, eMonster) {
  const elementPoint = elementPoint(monster, eMonster);
  const monsterTotalPoint = monsterTotalPoint(monster);
  const eMonsterTotalPoint = monsterTotalPoint(eMonster);

  return (
    ((monster.ability.stats.atk * monsterTotalPoint) /
      (eMonsterTotalPoint + eMonster.ability.stats.def)) *
    10 *
    elementPoint
  );
}

export {
  chooseEnemyMonster,
  elementPoint,
  monsterTotalPoint,
  calculatingDamageNormalAttack,
};

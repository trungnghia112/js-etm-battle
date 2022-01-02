export default function chooseEnemyMonster(position, eMonsters, skill) {
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
                ePositions.every(ePos => {
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
                ePositions.every(ePos => {
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
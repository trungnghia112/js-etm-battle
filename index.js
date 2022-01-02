let json_monsters = require('./data/monsters.json');
let json_emonsters = require('./data/emonsters.json');
let json_skills = require('./data/skills.json');

import chooseEnemyMonster from './libs/helper.js';

console.log(json_emonsters[0])

const pos = chooseEnemyMonster(1,json_emonsters);
console.log(pos);

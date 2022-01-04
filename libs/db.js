class Database {
  create(body) {
    localStorage.setItem(
      'etermon-battle-' + body.gameround,
      JSON.stringify(body)
    );
  }

  get(gameround) {
    return localStorage.getItem('etermon-battle-' + gameround);
  }

  makeid(length = 4) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

module.exports.Database = Database;

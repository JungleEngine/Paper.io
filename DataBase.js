const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/game.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
});

db.serialize(() => {
    db.each(`SELECT username as id,
                  score as score
           FROM players Where username = '3bhady'`, (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(row.id + "\t" + row.score);
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
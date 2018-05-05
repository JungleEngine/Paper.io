var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('paperio');

db.serialize(function() {

    db.run("DELETE from users");
    //create table if first time.
    //db.run("CREATE TABLE users (username TEXT, password TEXT)");

    var stmt = db.prepare("INSERT INTO users VALUES (?,?)");

    stmt.run("ali","1234");
    stmt.run("yousef","1234");
    stmt.run("3bhady","1234");
    stmt.run("samir","1234");
    stmt.run("ali1","1234");
    stmt.run("ali2","1234");
    stmt.run("ali3","1234");
    stmt.run("ali4","1234");
    stmt.run("ali5","1234");

    stmt.finalize();

    db.each("SELECT rowid AS id, username, password FROM users " +
        "where username = 'ali' and password = '1234'", function(err, row) {
        console.log(row.id + ": " + row.username + " " +row.password);
    });
});

db.close();
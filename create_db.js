let sqlite = require("sqlite3").verbose();
let log = console.log

//db.run("DROP TABLE account", (err)=> log("drop ", err));

function create_account_table()
{
	let db = new sqlite.Database("./user.db");
	
	db.run(`CREATE TABLE IF NOT EXISTS account(
			user_id INTEGER PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL
				)`,
			[],
			function (err)
			{
				if (err)
					console.log("create account table" + err);
				db.close();
			});
}
//db.run("DROP TABLE session", (err)=> log("drop ", err));

function create_session_table()
{
	let db = new sqlite.Database("./user.db");
	
	db.run(`CREATE TABLE IF NOT EXISTS session(
			loggedin INTEGER,
			username TEXT NOT NULL,
			sid TEXT
				)`, 
			[],
			function (err)
			{
				if (err)
					console.log("create session table: ", err);
				db.close();
			});
}
create_account_table();
create_session_table();

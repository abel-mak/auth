let sqlite = require("sqlite3").verbose();
let log = console.log

function insert(/**object*/user)
{
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.run(`INSERT INTO account(username, password) VALUES (?, ?)`,
					[user.username, user.password],
					function (err)
					{
						if (err)
							return reject("inser " + err);
						resolve();
						db.close();
					});
			});
}

function check_creds(user)
{
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.get(`SELECT * FROM account WHERE username=(?)`,
						[user.username],
						function (err, row)
						{
							if (err)
								return reject("check_creds: " + err);
							if (row && (row.password == user.password))
								resolve(true);
							else
								resolve(false);
							db.close();
						});
			});
}

function uuid()
{
	let hex = "0123456789abcdef";
	let res;
	let i;
	
	res = "";
	i = 0;
	while (i < 32)
	{
		res += hex[parseInt(Math.random() * 15)];
		i++;
	}
	return res;
}

//issue with destroy_cookie not throwing error when there is

function destroy_cookie(cookie)
{
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.run(`DELETE FROM session WHERE sid=(?)`,
						cookie,
						function (err)
						{
							if (err)
								return reject("destroy_cookie: " + err);
							resolve();
							db.close();
						})
			})
}

//const user = 
//	{
//		name:"abdelali",
//		password:"123"
//	};

//logout(user);

function is_loggedin(user)
{
	let db = new sqlite.Database("./user.db");

	return new Promise((resolve, reject) =>
			{
				db.get(`SELECT * FROM session WHERE username=(?)`,
						[user.username],
						function (err, row)
						{
							if (err)
								return reject("is_loggedin: " + err);
							if (row == undefined)
								resolve(0);
							else
								resolve(1);
							db.close();
						});
			})
}

function get_cookie(user)
{
	let sid = uuid();
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.run(`INSERT INTO session(loggedin, username, sid) VALUES (?, ?, ?)`,
						[1, user.username, sid],
						function (err)
						{
							if (err)
								return reject("get_cookie: " + err);
							resolve(sid);
							db.close();
						});
			})
}

function get_user_by_cookie(/**string*/cookie)
{
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.get(`SELECT * FROM session WHERE sid=(?)`,
						[cookie],
						function (err, row)
						{
							if (err)
								return reject("is_valid: " + err)
							resolve(row);
							db.close();
						});
			});
}



//insert(user);

/*
 * The get() method executes an SQL query and calls the callback function on the first result row.
 * In case the result set is empty, the row argument is undefined.
 */

function is_exist(username)
{
	let db = new sqlite.Database("./user.db");
	
	return new Promise((resolve, reject) =>
			{
				db.get(`SELECT username FROM account WHERE username=(?)`,
					[username], 
					function (err, row)
					{
						if (err)
							return reject("is_exist: " + err);
						resolve(row == undefined ? false : true);
						db.close();
					});
			});
}

module.exports = 
	{
		is_exist,
		check_creds,
		insert,
		get_cookie,
		is_loggedin,
		destroy_cookie,
		get_user_by_cookie
	}

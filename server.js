"use strict"
const http = require("http");
const url = require("url");
const {is_exist, check_creds, insert, is_loggedin, get_cookie, destroy_cookie, get_user_by_cookie} = require("./database.js");
const query = require("querystring");
const sha256 = require("crypto-js/sha256");
const fs = require("fs");
const root = "./www";
const PORT = 8081;

/*
 * readFileSync() is synchronous and blocks execution until finished. 
 * These return their results as return values. readFile() are asynchronous 
 * and return immediately while they function in the background
 */

async function get(req, res, path)
{
	let cookie;
	let user;

	cookie = query.parse(req.headers.cookie).cookie;
	user = await get_user_by_cookie(cookie).catch((err) => res.int_error(err));
	/*if unathenticate and wanna access restricted path*/
	if (path.startsWith("/static/") == false && !path.startsWith("/login/") 
		&& !path.startsWith("/signup/")&& (user == undefined || cookie == null))
	{
		return res.redirect("/login/login.html");
	}
	else if (user != null && (path.startsWith("/login/") || path.startsWith("/signup")))
	{
		return res.redirect("/", "user already logged in!");
	}
	path = (path == "/") ? "/index.html" : path
	res.setHeader("Content-Type", "text/html ; charset=utf8");
	fs.readFile(root + path, (err, data) =>
				{
					if (err)
						return res.notfound(err);
					res.write(data.toString().replace("###", (user) ? user.username : ""));
					res.end();
				});
}

async function login(req, res, body)
{
	let cookie;
	let user;
	let creds;

	res.setHeader("Content-Type", "text/html ; charset=utf8");
	user = JSON.parse(body);
	user.password = sha256(user.password).toString();
	try
	{
		creds = await check_creds(user)
		if (await is_exist(user.username) == true 
				&& creds == true)
		{
			cookie = await get_cookie(user);
			res.set_cookie(cookie);
			res.end(JSON.stringify({err:null, message:`🎉 welcome at 🏡 ${user.username}`}));
		}
		else if (creds == false)
			res.end(JSON.stringify(
				{err:"wrong creds", message:`😏 wrong username or password`}));
	}
	catch(err)
	{
		res.int_error(err);
	}
}

function logout(req, res, body)
{
	let cookie = query.parse(req.headers.cookie).cookie;
	
	res.setHeader("Content-Type", "application/json ; charset=utf8");
	destroy_cookie(cookie)
	.then(() => res.end())
	.catch((err) => int_error(err));
}

async function signup(req, res, body)
{
	let user = {};
	let is_username_used;

	res.setHeader("Content-Type", "application/json ; charset=utf8");
	body = JSON.parse(body);
	user = {
		username:body.username,
		password:body.password
	};
	try
	{
		is_username_used = await is_exist(body.username)
		if (body.username != "" && body.password != "" && is_username_used == false)
		{
			user.password = sha256(user.password).toString();
			insert(user)
			.then(()=> 
				{
					res.end(JSON.stringify({err:null, 
							message:"successfully signed up you can now login"}));
				})
		}
		else if (is_username_used == true)
			res.end(JSON.stringify({err:"used username" ,
						message:"The username " + body.username + " is taken"}));
	}
	catch(err)
	{
		res.int_error(err);
	}
}

function add_functions(request, response)
{
	response.redirect = function(path, statusMessage)
	{
		this.statusCode = 302;
		this.statusMessage = (statusMessage == null) ? "" : statusMessage;
		this.setHeader("Location", path);
		this.end();
	}
	request.get_body = function(callback)
	{
		let body = "";

		this.on("data", (chunk)=>
				{
					body += chunk;
				});
		this.on("end", () => 
				{
					callback(request, response, body)
				});
	}
	response.notfound = function (err)
	{
		this.statusCode = 404;
		this.write("<h1> 404 NOT FOUND </h1>" + err);
		this.end();
	}
	//A cookie with the HttpOnly attribute is inaccessible to the JavaScript 
	//Document.cookie API; it is sent only to the server
	response.set_cookie = function (cookie)
	{
		this.writeHead(200,
				{
					"Set-Cookie":"cookie=" + cookie + ";HttpOnly",
				});
	}
	response.int_error = function (err)
	{
		this.statusCode = 500;
		this.end()
		console.log(err);
	}
	return [request, response];
}

const server = http.createServer((req, res) =>
		{
			let path;
			let user;//object

			[req, res] = add_functions(req, res);
			path = url.parse(req.url).path;
			console.log(req.method + ":" + req.url);
			if (req.method == "GET" && (path == "/" || path.endsWith(".html") 
						|| path.endsWith(".js") || path.endsWith(".css")))
			{
				get(req, res, path);
			}
			else if (req.method == "POST" && path == "/login")
			{
				req.get_body(login);
			}
			else if (req.method == "POST" && path == "/logout")
			{
				req.get_body(logout);
			}
			else if (req.method == "POST" && path == "/signup")
			{
				req.get_body(signup);
			}
			else
				res.notfound();
		});

server.listen(PORT, () =>
		{
			console.log("server 👂 on " + PORT);
		});
//Reference
//https://codeshack.io/secure-login-system-php-mysql/
//uuid:https://stackoverflow.com/questions/18078711/how-it-is-possible-to-generate-session-id-in-node-js
//https://www.hackingarticles.in/beginner-guide-understand-cookies-session-management/
//uuid:https://www.towerdata.com/blog/2010/09/13/why-unique-identifiers-should-not-be-used-in-cookies
//https://github.com/Developer-Y/cs-video-courses#web-programming-and-internet-technologies

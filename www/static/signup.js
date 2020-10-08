let form = document.querySelector("form");
let message_box = document.querySelector("#message");

function succ_alert(m)
{
	message_box.style.color = "white";
	message_box.style.backgroundColor="green";
	message_box.innerHTML = "<h3>" + m + "</h3>"
	setTimeout(()=>
			{
				message.style.color = "black";
				message.style.backgroundColor="white";
			}, parseInt(message.style.transitionDuration) * 1000);
	console.log(message.style.transitionDruation)
}

function red_alert(m)
{
	message_box.style.color = "white";
	message_box.style.backgroundColor="red";
	message_box.innerHTML = "<h3>" + m + "</h3>"
	setTimeout(()=>
			{
				message.style.color = "black";
				message.style.backgroundColor="white";
			}, parseInt(message.style.transitionDuration) * 1000);
	console.log(message.style.transitionDruation)
}
form.addEventListener("submit", function (e)
		{
			e.preventDefault();
			console.log("🧨🧨🧨");
			console.log(form.password.value);
			console.log(form.cpassword.value);
			if (form.password.value == form.cpassword.value)
			{
				fetch("/signup",
						{
							method:"POST",
							body:JSON.stringify(
									{
										username:form.username.value.trim(),
										password:form.password.value
									})
						})
				.then(res => 
					{
						if (res.status == 500)
							throw new Error("Internal server error");
						return res.json()
					})
				.then((res) =>
						{
							if (res.err == null)
								return succ_alert(res.message);
							red_alert(res.message);	
						})
				.catch(err => red_alert(err));
			}
			else
			{
				form.password.value = "";
				form.cpassword.value = "";
				red_alert(new Error("Wrong password"));
			}

		});

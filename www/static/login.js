let form = document.querySelector("form");
let message = document.querySelector("#message");

function succ_alert(m)
{
	message.style.color = "white";
	message.style.backgroundColor="green";
	message.innerHTML = "<h3>" + m + "</h3>";
	setTimeout(()=>
			{
				message.style.color = "black";
				message.style.backgroundColor="white";				
			}, parseInt(message.style.transitionDuration) * 1000);
	console.log(message.style.transitionDruation)
}
function red_alert(m)
{
	message.style.color = "white";
	message.style.backgroundColor="red";
	message.innerHTML = "<h3>" + m + "<h3>";
	setTimeout(()=>
			{
				message.style.color = "black";
				message.style.backgroundColor="white";				
			}, parseInt(message.style.transitionDuration) * 1000);
	console.log(message.style.transitionDruation)
}

form.addEventListener("submit", 
		function (e)
		{
			e.preventDefault();
			console.log("🎈🎈🎈");		
			//console.log(form.username.value, form.password.value)
			fetch("/login",
				{
					method:"POST",
					body:JSON.stringify({
					    username:form.username.value.trim(),
					    password:form.password.value
					})
				})
		    	.then((res) =>
				{
					if (res.status == 500)
						throw new Error("internal server error");
					return res.json();
				})
		    	.then((res) => 
			    {
				if (res.err == null)
				{
					succ_alert(res.message);
					location.reload();    
				}
				else
					red_alert(res.message);
			})
			.catch(err => red_alert(err));
		});

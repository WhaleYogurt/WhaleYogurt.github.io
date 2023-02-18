let counter = 0;

function Change(){
	document.getElementById("demo").innerHTML = "Paragraph changed.";
}
function Count(){
	counter += 1;
	document.getElementById("count").innerHTML = "Count: "+counter; 
}
	
function AHBN_Download(){
	fetch("WhaleYogurt.github.io/API/AHBND_Stats.json")
		.then(function(resp)) {
		      return resp.json();
		})
		.then(function(data)) {
		      console.log(data):
		});
}

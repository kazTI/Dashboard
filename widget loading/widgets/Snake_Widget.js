let div0 = document.createElement('div');
div0.className = 'widget';
div0.id = 'Snake';
container.appendChild(div0);

let button1 = document.createElement("button");
button1.innerHTML = "test";
button1.onclick = ()=>{alert("Hoi")}

let Snake_Widget = document.getElementById("Snake");
Snake_Widget.innerHTML = "Snake" + "<hr>";

Snake_Widget.appendChild(button1);
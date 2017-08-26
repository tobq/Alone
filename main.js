var canvas = document.getElementsByTagName("canvas")[0],
	c = canvas.getContext("2d"),
	requestFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		(cb => window.setTimeout(cb, 1000 / 30));

function sign() {
	return Math.random() > 0.5 ? 1 : -1;
}
function an() {
	c.restore();
	c.save();
	c.clearRect(0, 0, canvas.width, canvas.height);
	c.translate(canvas.width / 2, canvas.height / 2);
	c.scale(CONTROLS.zoom, CONTROLS.zoom);
	c.rotate(-Math.PI / 2 - player.angle);
	for (var i = World.objects.length; i--;) {
		var part = World.objects[i];
		if (part.isPlayer) {
			c.save();
			c.rotate(part.angle + Math.PI / 2);
			if (CONTROLS.keysDown[38]) c.drawImage(SPRITES.flame, -part.radius, 8 - part.radius, part.diameter, part.diameter * 2);
			c.drawImage(SPRITES.ship, -part.radius, -part.radius, part.diameter, part.diameter);
			c.restore();
		}
		else {
			c.beginPath();
			c.fillStyle = part.colour;
			c.arc(part.coords.x - player.coords.x, part.coords.y - player.coords.y, part.radius, 0, 2 * Math.PI);
			c.fill();
		}
	}
	requestFrame(an);
}
function elapse() {
	for (var i = World.objects.length; i--;) {
		var par = World.objects[i];
		for (var j = i; j--;) {
			var opar = World.objects[j],
				rv = par.coords.copy().subtract(opar.coords),
				r2 = rv.dot(rv),
				ru = rv.unit(),
				d2 = (par.radius + opar.radius) * (par.radius + opar.radius);
			if (r2) {
				if (r2 < d2) {
					if (par.velocity.x || par.velocity.y || opar.velocity.x || opar.velocity.y) {
						var n1d = ru.copy().sMultiply(2 * par.velocity.dot(ru)),
							n2 = ru.copy().sMultiply(opar.velocity.dot(ru)),
							v2 = n1d.copy().sMultiply(par.mass).add(n2.copy().sMultiply(opar.mass - par.mass)).sDivide(opar.mass + par.mass);

						par.velocity.add(v2).add(n2).subtract(n1d);
						opar.velocity.add(v2).subtract(n2);
					}
					var factor = ru.sMultiply((par.radius + opar.radius - Math.sqrt(r2)) / (par.mass + opar.mass));
					par.coords.add(factor.copy().sMultiply(opar.mass));
					opar.coords.subtract(factor.sMultiply(par.mass));
				} else if (r2 !== d2) {
					par.velocity.subtract(ru.copy().sMultiply(World.G * opar.mass / r2));
					opar.velocity.add(ru.copy().sMultiply(World.G * par.mass / r2));
				}
			}
		}
		par.coords.add(par.velocity);
		par.velocity.sMultiply(World.smoothness);
	}
	if (CONTROLS.keysDown[37]) player.angle -= player.agility;
	if (CONTROLS.keysDown[38]) player.velocity.add(new vec2(Math.cos(player.angle), Math.sin(player.angle)).sMultiply(player.speed));
	if (CONTROLS.keysDown[39]) player.angle += player.agility;
	slider.style.right = ((100 * ((player.angle - Math.PI / 2) / 2 / Math.PI % 1 + 1) + 1.3888) % 100) + "%";
}
window.onresize = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
window.onkeydown = function checkKey(e) {
	e = e || window.event;
	CONTROLS.keysDown[e.keyCode] = true;
}
window.onkeyup = function checkKey(e) {
	e = e || window.event;
	CONTROLS.keysDown[e.keyCode] = false;
}

window.onwheel = function (e) {
	CONTROLS.zoom *= (e.wheelDelta || -1 * event.deltaY) > 0 ? CONTROLS.zoomSpeed : 1 / CONTROLS.zoomSpeed;
}

var CONTROLS = {
	keysDown: {},
	zoom: 1,
	zoomSpeed: 1.2
},
	SPRITES = {};
SPRITES.ship = new Image();
SPRITES.ship.src = 'ship.svg';
SPRITES.flame = new Image();
SPRITES.flame.src = 'flame.svg';

var World = {
	smoothness: 1,
	rebound: -1,
	objects: [],
	G: 0.011
};
var earth = new Particle({
	radius: 6371,
	density: 1,
	coords: new vec2(100, 100)
});
var r = 384405,
	moon = new Particle({
		radius: 1738,
		coords: new vec2(0, r)
	});
moon.orbit(earth);

var player = new Particle({
	radius: 10,
	coords: new vec2(earth.radius + 40000, 0),
});
player.orbit(earth);
player.angle = 0;
player.speed = 10;
player.agility = 0.05;
player.isPlayer = true;

for (var i = 1000, rWidth = 50000; i--;) {
	var r = earth.diameter * 4 + Math.random() * rWidth;
	new Particle({
		radius: 5 + Math.ceil(Math.random() * 10),
		coords: new vec2(Math.cos(a), Math.sin(a)).sMultiply(r),
	}).orbit(earth);
}

var row = document.getElementsByClassName("row"),
	slider = document.getElementById("slider");
for (var j = 2; j--;) {
	var i = 0;
	for (var k = 0; k < 4; k++) {
		var a = document.createElement("div");
		a.className = "angle bearing";
		a.textContent = ["N", "E", "S", "W"][k];
		row[j].appendChild(a);
		while (i++ < k * 9 + 8) {
			var a = document.createElement("div");
			a.className = "angle";
			a.textContent = i * 10;
			row[j].appendChild(a);
		}
	}
}


onresize();
requestFrame(an);
setInterval(elapse, 1000 / 30);

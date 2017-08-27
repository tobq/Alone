var canvas = document.getElementsByTagName("canvas")[0],
	speedCount = document.getElementById("speed"),
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
			if (CONTROLS.keysDown[38]) c.drawImage(SPRITES.flame, -part.radius, -80 + part.radius, part.diameter, part.diameter * 2);
			c.drawImage(SPRITES.ship, -part.radius, -80 - part.radius, part.diameter, part.diameter * 2);
			c.fillStyle = "red"
			c.arc(0, 0, part.radius, 0, 2 * Math.PI);
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
				r2 = rv.dot(rv);
			if (r2) {
				var d2 = (par.radius + opar.radius) * (par.radius + opar.radius),
					ru = rv.unit();
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
					opar.velocity.add(ru.sMultiply(World.G * par.mass / r2));
				}
			}
		}
		par.coords.add(par.velocity.copy().sDivide(World.INTERVALS));
		par.velocity.sMultiply(World.smoothness);
	}
	if (CONTROLS.keysDown[37]) player.angle -= player.agility;
	if (CONTROLS.keysDown[38]) player.velocity.add(new vec2(Math.cos(player.angle), Math.sin(player.angle)).sMultiply(player.thrust));
	if (CONTROLS.keysDown[39]) player.angle += player.agility;
	slider.style.right = ((100 * ((player.angle - Math.PI / 2) / 2 / Math.PI % 1 + 1) + 1.3888) % 100) + "%";
	speedCount.textContent = Math.round(player.velocity.copy().subtract(earth.velocity).mag());
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
	G: 6.67408E-11,
	INTERVALS: 60
};
var sun = new Particle({
	radius: 6.95700E8,
	coords: new vec2(0, 0),
	density: 1.408E3,
	colour: "yellow"
}),
	earth = new Particle({
		radius: 6.371E6,
		density: 5.514E3,
		colour: "#4E71B2"
	}),
	venus = new Particle({
		radius: 6.0518E6,
		density: 5.243E3,
		colour: "orange"
	}),
	moon = new Particle({
		radius: 1.737E6,
		density: 3.344E3,
		colour: "grey"
	});
earth.orbit(sun, false, 1.496E11);
venus.orbit(sun, false, 1.0821E11);
moon.orbit(earth, false, 3.84405E8);


var player = new Particle({
	radius: 56,
	coords: earth.coords.copy().add(new vec2(earth.radius + 57, 0))
});
player.velocity = earth.velocity.copy();
player.angle = 0;
player.thrust = 3 * earth.gravity();
player.agility = 0.05;
player.isPlayer = true;

for (var i = 50, rWidth = earth.diameter * 5; i--;) new Particle({
	radius: 20000 + Math.ceil(Math.random() * 50000),
}).orbit(earth, false, earth.diameter * 5 + Math.random() * rWidth);

var row = document.getElementsByClassName("row"),
	slider = document.getElementById("slider");
for (var j = 2; j--;) {
	var i = 0;
	for (var k = 0; k < 4; k++) {
		var a = document.createElement("div");
		a.className = "angle bearing";
		a.textContent = ["W", "N", "E", "S"][k];
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
setInterval(elapse, 1000 / World.INTERVALS);

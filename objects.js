/** @constructor */
function vec2(x, y) {
	this.x = x;
	this.y = y;
}

vec2.radian = function (rads) {
	return new vec2(Math.cos(rads), Math.sin(rads));
	// Unit vector for radian angle
}
vec2.degree = function (degrees) {
	return vec2.radian(degrees / 180 * Math.PI);
	// Unit vector for degree angle
}

vec2.prototype.copy = function () {
	return new vec2(this.x, this.y);
	// Copy vector, so original vector is not mutated by chained methods
};

vec2.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

vec2.prototype.sAdd = function (scalar) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

vec2.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

vec2.prototype.sSubtract = function (scalar) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

vec2.prototype.divide = function (vec) {
	this.x /= vec.x;
	this.y /= vec.y;
	return this;
};

vec2.prototype.sDivide = function (scalar) {
	this.x /= scalar;
	this.y /= scalar;
	return this;
};

vec2.prototype.multiply = function (vec) {
	this.x *= vec.x;
	this.y *= vec.y;
	return this;
};

vec2.prototype.sMultiply = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

vec2.prototype.dot = function (vec) {
	return this.x * vec.x + this.y * vec.y;
	// Dot product
};

vec2.prototype.mag = function () {
	return Math.sqrt(this.dot(this));
	// Magnitude of vector (Pythagoras)
};

vec2.prototype.unit = function () {
	return this.copy().sDivide(this.mag());
	// Unit vector
};

vec2.prototype.ceil = function () {
	this.x = Math.ceil(this.x);
	this.y = Math.ceil(this.y);
	return this;
	// Ceil vector components
};

vec2.prototype.floor = function () {
	this.x = Math.floor(this.x);
	this.y = Math.floor(this.y);
}

vec2.prototype.perp = function () {
	a = this.x;
	this.x = this.y;
	this.y = -a;
	return this;
	// Perpendicular vector to vector
};

vec2.prototype.random = function () {
	this.x *= Math.random();
	this.y *= Math.random();
	return this;
	// Randomise vector
};

vec2.prototype.bound = function (component, min, max) {
	if (this[component] < min) this[component] = Math.min(max, 2 * min - this[component]);
	else if (this[component] > max) this[component] = Math.max(min, 2 * max - this[component]);
	else return true;
	// Bind component to a bounary, which it is flipped about, if outside.
};

vec2.prototype.angle = function (vec) {
	return Math.acos(this.dot(vec) / (this.mag() * vec.mag()));
	// Angle between another vector (radians)
};

/** @constructor */
function Particle(opts) {
	if (!opts) opts = {};
	this.colour = opts.colour || "#" + Array(4).join((100 + Math.floor(Math.random() * 60)).toString(16));
	this.radius = opts.radius || 20;
	this.velocity = opts.velocity || new vec2(0, 0);
	this.density = opts.density || 1;
	this.diameter = this.radius * 2;
	this.mass = 4 / 3 * Math.PI * this.radius * this.radius * this.radius * this.density;
	this.coords = opts.coords || new vec2(500, 500).random();
	World.objects.push(this);
}
Particle.prototype.momentum = function () {
	return this.velocity.copy().sMultiply(this.mass);
};
Particle.prototype.energy = function () {
	return this.velocity.dot(this.velocity) * this.mass / 2;
};

Particle.prototype.teleport = function (part) {
	this.orbit(part, true, part.radius * 1.1 + this.radius)
};

Particle.prototype.orbit = function (part, ACW, radius, angle) {
	if (radius) this.coords = part.coords.copy().add(vec2.radian(angle || Math.random() * 2 * Math.PI).sMultiply(radius));
	var diff = this.coords.copy().subtract(part.coords);
	this.velocity = part.velocity.copy().add(diff.perp().unit().sMultiply(Math.sqrt(part.mass * World.G / diff.mag()) * (ACW ? 1 : -1)));
};


Particle.prototype.gravity = function () {
	return World.G * this.mass / (this.radius * this.radius);
};

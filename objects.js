/** @constructor */
function vec2(x, y) {
	this.x = x;
	this.y = y;
}

vec2.prototype.copy = function () {
	return new vec2(this.x, this.y);
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
};

vec2.prototype.mag = function () {
	return Math.sqrt(this.dot(this));
};

vec2.prototype.unit = function () {
	return this.copy().sDivide(this.mag());
};

vec2.prototype.ceil = function () {
	this.x = Math.ceil(this.x);
	this.y = Math.ceil(this.y);
	return this;
};

vec2.prototype.random = function () {
	this.x *= Math.random();
	this.y *= Math.random();
	return this;
};

vec2.prototype.bound = function (component, min, max) {
	if (this[component] < min) this[component] = Math.min(max, 2 * min - this[component]);
	else if (this[component] > max) this[component] = Math.max(min, 2 * max - this[component]);
	else return true;
};

/** @constructor */
function Particle(opts) {
	if (!opts) opts = {};
	this.colour = opts.colour || "#" + Array(4).join((40 + Math.floor(Math.random() * 60)).toString(16));
	this.radius = opts.radius || 20;
	this.velocity = opts.velocity || new vec2(0, 0);
	this.density = opts.density || 1;
	this.diameter = this.radius * 2;
	this.mass = this.radius * this.radius * this.density;
	this.coords = opts.coords || new vec2(500, 500).random().subtract(Sun.coords);
	World.objects.push(this);
}
Particle.prototype.momentum = function () {
	return this.velocity.copy().sMultiply(this.mass);
};
Particle.prototype.energy = function () {
	return this.velocity.dot(this.velocity) * this.mass / 2;
};

"use strict";

/** @constructor */
function Spart(onNeighbour) {
	if (typeof onNeighbour !== "function") throw "Invalid onNeighbour callback passed";
	this.objects = [];
	this.gridSize = [0, 0];
	this.onNeighbour = onNeighbour;
}

Spart.prototype.add = function (object, width, height) {
	if (this.gridSize[0] < width) this.gridSize[0] = width;
	if (this.gridSize[1] < height) this.gridSize[1] = height;
	this.objects.push({ object: object });
}

Spart.prototype._neighbour = function (object, ogrid) {
	var ok = ogrid.length;
	while (ok--) this.onNeighbour(object, ogrid[ok].object);
}

Spart.prototype.check = function () {
	var i = this.objects.length;
	this.bounds = [Infinity, Infinity, -Infinity, -Infinity];
	while (i--) { // Set bounds
		var coords = this.objects[i].object.coords;
		if (this.bounds[0] > coords.x) this.bounds[0] = coords.x;
		if (this.bounds[1] > coords.y) this.bounds[1] = coords.y;
		if (this.bounds[2] < coords.x) this.bounds[2] = coords.x;
		if (this.bounds[3] < coords.y) this.bounds[3] = coords.y;
	}
	var width = this.bounds[2] - this.bounds[0],
		height = this.bounds[3] - this.bounds[1];

	if (width < 2 * this.gridSize[0] && height < 2 * this.gridSize[1]) { // If 2x2 or smaller, skip gridding :  n * (n - 1) / 2 
		i = this.objects.length;
		while (i--) {
			var grob = this.objects[i],
				j = i;
			while (j--) this.onNeighbour(grob.object, this.objects[j].object);
		}
	} else {
		// Clear grids
		var i = Math.ceil(width / this.gridSize[0]),
			J = Math.ceil(height / this.gridSize[1]);
		if (width % this.gridSize[0] === 0) i++;
		if (height % this.gridSize[0] === 0) J++;
		this.grid = [];
		while (i--) {
			this.grid[i] = [];
			var j = J;
			while (j--) this.grid[i][j] = [];
		}

		// Re-assign grid objects, based on their coordinates
		i = this.objects.length;
		while (i--) {
			var grob = this.objects[i];
			grob.grid = this.grid[Math.floor((grob.object.coords.x - this.bounds[0]) / this.gridSize[0])][Math.floor((grob.object.coords.y - this.bounds[1]) / this.gridSize[1])];
			grob.grid.push(grob);
		}

		i = this.grid.length;
		while (i--) {
			var gridx = this.grid[i],
				iLUB = i !== this.grid.length - 1; // I: not last element
			j = gridx.length;
			while (j--) {
				var grid = gridx[j], // Focused grid cell
					k = grid.length,
					jLUB = j !== gridx.length - 1, // J: not last element
					jG0 = j !== 0; // J: not first element
				while (k--) {
					grob = grid[k]; // Focused grid object
					var ok = k;
					while (ok--) this.onNeighbour(grob.object, grid[ok].object); // Check same cell
					if (iLUB) { // If there is space to the right
						var ogridx = this.grid[i + 1]; // Row of grids to the right of focused grid
						if (jG0) this._neighbour(grob.object, ogridx[j - 1]); // Check top-right
						this._neighbour(grob.object, ogridx[j]); // Check right
						if (jLUB) this._neighbour(grob.object, ogridx[j + 1]); // Check bottom-right
					}
					if (jLUB) this._neighbour(grob.object, gridx[j + 1]); // If there is space to the below, check below
				}
			}
		}
	}
}
'use strict';
var canvas,
	ctx,
	scrollX = 0,
	scrollY = 0,
	level,
	assets = {},
	TILE_WIDTH,
	TILE_HEIGHT,
	tile,
	sprite,
	compressedLevel,
	cSprites = [],
	keyInput = {
		up: false,
		down: false,
		left: false,
		right: false,
		sprint: false
	};

let tpsC,
	fpsC,
	tpsElem,
	fpsElem;

function step() {
	runSprites();

	scrollX = Math.round(Math.max(Math.min(scrollX, 0), (level.width * -TILE_WIDTH) + canvas.width)); // keep scrolling in boundaries and round
	scrollY = Math.round(Math.max(Math.min(scrollY, 0), (level.height * -TILE_HEIGHT) + canvas.height));

	let now = performance.now();
	tpsElem.innerHTML = Math.round(1000 / (now - tpsC));
	tpsC = now;
};
function draw() {
	ctx.fillStyle = "magenta"; // temporary bg
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawTiles(scrollX, scrollY);
	drawSprites(scrollX, scrollY);

	let now = performance.now();
	fpsElem.innerHTML = Math.round(1000 / (now - fpsC)); // fps counter
	fpsC = now;

	requestAnimationFrame(draw);
};

function runSprites() {
	for (let sN in cSprites) // sN is spriteNumber
		cSprites[sN].update(sN);
}
function drawSprites(ox, oy) {
	for (let s of cSprites)
		ctx.drawImage(
			assets[s.img[0]],
			s.img[1],
			s.img[2],
			s.img[3],
			s.img[4],
			Math.round(s.pos.x) + ox,
			Math.round(s.pos.y) + oy,
			s.img[3],
			s.img[4],
		);
}
function drawTiles(ox, oy) {
	for (let y = 0; y < level.height; y++)
		for (let x = 0; x < level.width; x++) {
			let t = sScript.getTile(x, y, false).tile;
			ctx.drawImage(
				assets[t.img[0]],
				t.img[1] * TILE_WIDTH,
				t.img[2] * TILE_HEIGHT,
				TILE_WIDTH,
				TILE_HEIGHT,
				x * TILE_WIDTH + ox,
				y * TILE_HEIGHT + oy,
				TILE_WIDTH,
				TILE_HEIGHT,
			);
		}
}

function press(v) {
	return function (key) {
		switch (key.code) {
			case "ArrowUp":
			case "Space":
			case "KeyW":
			case "KeyX":
				keyInput.up = v; break;
			case "ArrowDown":
			case "KeyS":
				keyInput.down = v; break;
			case "ArrowLeft":
			case "KeyA":
				keyInput.left = v; break;
			case "ArrowRight":
			case "KeyD":
				keyInput.right = v; break;
			case "ShiftLeft":
			case "KeyZ":
				keyInput.sprint = v; break;
		}
	};
}

function ndArray(bg, ...dim) {
	if (dim.length) {
		let a = [],
			l = dim[0],
			d = dim.slice(1);
		for (let i = 0; i < l; i++)
			a.push(ndArray(bg, ...d));
		return a;
	} else
		return bg;
};
function Level(data, bg = 0) {
	this.width = data.width;
	this.height = data.height;
	this.sprites = data.sprites;
	this.assets = data.assets;

	for (let s of data.assets)
		if (!assets[s]) {
			let i = document.createElement('img');
			i.src = `assets/${s}.png`;
			document.getElementById('assets').appendChild(i);
			assets[s] = i;
		}

	this.tiles = ndArray(bg, this.height, data.width);
	for (let rect of data.tiles) {
		rect.xe = rect.xe || rect.x;
		rect.ye = rect.ye || rect.y;
		for (let y = rect.y; y <= rect.ye; y++)
			for (let x = rect.x; x <= rect.xe; x++)
				this.tiles[y][x] = rect.id;
	}
};

function start() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	tpsElem = document.getElementById('tps');
	fpsElem = document.getElementById('fps');

	level = new Level(compressedLevel);

	for (let s of level.sprites)
		cSprites.push(new (s[0].split('.').reduce((a, b) => a[b], sprite))(...s.slice(1)));

	addEventListener("keydown", press(true));
	addEventListener("keyup", press(false));

	tpsC = performance.now();
	fpsC = performance.now();
	setInterval(step, 8); // 125 tps
	requestAnimationFrame(draw);
}
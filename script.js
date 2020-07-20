'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var cSprites = [
	new sprite.Player(64, 160),
	new sprite.Enemy(96, 160)
];

let step;
let draw;
{
	let tpsC = performance.now();
	let fpsC = performance.now();
	const tpsElem = document.getElementById('tps');
	const fpsElem = document.getElementById('fps');

	step = function () {
		runSprites();

		scrollX = Math.round(Math.max(Math.min(scrollX, 0), (level.width * -TILE_WIDTH) + canvas.width)); // keep scrolling in boundaries and round
		scrollY = Math.round(Math.max(Math.min(scrollY, 0), (level.height * -TILE_HEIGHT) + canvas.height));

		let now = performance.now();
		tpsElem.innerHTML = Math.round(1000 / (now - tpsC));
		tpsC = now;
	};
	draw = function () {
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
				s.img[1] * TILE_WIDTH,
				s.img[2] * TILE_HEIGHT,
				s.img[3] * TILE_WIDTH,
				s.img[4] * TILE_HEIGHT,
				Math.round(s.pos.x) + ox,
				Math.round(s.pos.y) + oy,
				s.img[3] * TILE_WIDTH,
				s.img[4] * TILE_HEIGHT,
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
}

var keyInput = {
	up: false,
	down: false,
	left: false,
	right: false,
	sprint: false
};

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

addEventListener("keydown", press(true));
addEventListener("keyup", press(false));

window.setInterval(step, 8); // 125 tps
requestAnimationFrame(draw);
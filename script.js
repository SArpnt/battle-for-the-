const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

var cSprites = [
	new sprite.player(64, 160),
	new sprite.enemy(96, 160)
]
{
	let tpsC = performance.now()
	let fpsC = performance.now()
	function step() {
		runSprites()

		scrollX = Math.round(Math.max(Math.min(scrollX, 0), (level[0].length * -16) + 320)) //keep scrolling in boundaries and round
		scrollY = Math.round(Math.max(Math.min(scrollY, 0), (level.length * -16) + 240))

		$("#tps")[0].innerHTML = Math.round(1000 / (performance.now() - tpsC))
		tpsC = performance.now()
	}
	function draw(ms) {
		ctx.fillStyle = "magenta"
		ctx.fillRect(0, 0, 640, 480)//temporary sky

		drawTiles(scrollX, scrollY)
		drawSprites(scrollX, scrollY)

		$("#fps")[0].innerHTML = Math.round(1000 / (performance.now() - fpsC)) //fps counter
		fpsC = performance.now()

		requestAnimationFrame(draw)
	}
}

function runSprites() {
	for (let sN in cSprites) { //sN is spriteNumber
		let i = cSprites[sN].update(sN)
	}
}

function drawSprites(ox, oy) {
	for (let i in cSprites) {
		ctx.drawImage(
			cSprites[i].img,
			(Math.round(cSprites[i].pos.x) + ox) * 2,
			(Math.round(cSprites[i].pos.y) + oy) * 2
		)
	}
}

function drawTiles(ox, oy) {
	for (let y in level) {
		for (let x in level[y]) {
			ctx.drawImage(
				tile[level[y][x]].img,
				(x * 16 + ox) * 2,
				(y * 16 + oy) * 2
			)
		}
	}
}

addEventListener("keydown", press(true))
addEventListener("keyup", press(false))

var keyInput = {
	up: false,
	down: false,
	left: false,
	right: false,
	sprint: false
}

function press(v) {
	return function (key) {
		switch (key.code) {
			case "ArrowUp":
			case "Space":
			case "KeyW":
			case "KeyX":
				keyInput.up = v; break
			case "ArrowDown":
			case "KeyS":
				keyInput.down = v; break
			case "ArrowLeft":
			case "KeyA":
				keyInput.left = v; break
			case "ArrowRight":
			case "KeyD":
				keyInput.right = v; break
			case "ShiftLeft":
			case "KeyZ":
				keyInput.sprint = v
		}
	}
}

window.setInterval(step,8) // 125 tps
requestAnimationFrame(draw)
var sScript = {
	collide(pos) {
		var collisions = {
			up: false,
			down: false,
			left: false,
			right: false
		}

		var push = {
			gen: function (xy, rev, dir) { //rev stands for reverse
				return function (pos, tile) {
					let i = Math[rev ? 'ceil' : 'floor'](pos[xy] / 16) * 16
					if (
						(rev ? pos : pos.last)[xy] <= i &&
						(rev ? pos.last : pos)[xy] >= i
					) {
						pos[xy] = i
						pos[xy + 'v'] = 0
						collisions[dir] = true
						if (tile.onCollide) tile.onCollide(dir, tile.pos, null)
					}
					return pos
				}
			}
		}
		push.up = push.gen('y', false, 'up')
		push.down = push.gen('y', true, 'down')
		push.left = push.gen('x', false, 'left')
		push.right = push.gen('x', true, 'right')

		function pushif(dir, xo, yo) {
			let tI = sScript.getTile(pos.x + xo, pos.y + yo)
			if (tI.collide[dir]) {
				pos = push[dir](pos, tI)
			}
		}

		var pushlist = [
			['up', 16, 16],
			['up', 0, 16],
			['down', 16, 0],
			['down', 0, 0],
			['left', 16, 16],
			['left', 16, 0],
			['right', 0, 16],
			['right', 0, 0]
		]

		for (let i in pushlist)
			pushif(...pushlist[i])

		pos.collisions = collisions
		return pos
	},

	move(pos, input, op = {}) {
		{
			opDefault = {
				xs: 1,
				ys: 1,
				xg: false,
				yg: true,
				friction: 1.1,
				jump: -3
			}
			for (let i in opDefault)
				if (op[i] === undefined) op[i] = opDefault[i]
		}

		if (op.xg) {
			let flip = op.xs > 0
			let side = flip ? 'left' : 'right'
			if (pos.collisions[side] && input[side]) pos.xv = op.jump //jump
			pos.xv += op.xs * (0.1 - (input[side] * Math.max(-1 - pos.xv * (flip ? 1 : -1), 0) / 30)) //gravity is reduced on ascent while holding up for higher jumps
		} else {
			if (input.left) // walk/run
				pos.xv -= (.1 + keyInput.sprint * .05) * op.xs
			if (input.right)
				pos.xv += (.1 + keyInput.sprint * .05) * op.xs
		}
		if (op.yg) {
			let flip = op.ys > 0
			let side = flip ? 'up' : 'down'
			if (pos.collisions[side] && input[side]) pos.yv = op.jump
			pos.yv += op.ys * (0.1 - (input[side] * Math.max(-1 - pos.yv * (flip ? 1 : -1), 0) / 30))
		} else {
			if (input.up) // walk/run
				pos.yv -= (.1 + input.sprint * .05) * op.ys
			if (input.down)
				pos.yv += (.1 + input.sprint * .05) * op.ys
		}

		pos.y += pos.yv
		pos.x += pos.xv
		{
			if (!op.xg) pos.xv /= op.friction
			if (!op.yg) pos.yv /= op.friction
		}

		return pos
	},

	getTile(x, y) {
		try {
			if (x <= 0 || y <= 0) throw TypeError
			let tPos = { x: Math.floor(x / 16), y: Math.floor(y / 16) }
			let i = tile[level
			[tPos.y]
			[tPos.x]]
			if (!i) throw TypeError
			i.pos = tPos
			return i
		}
		catch (TypeError) {
			return tile[0]
		}
	}
}
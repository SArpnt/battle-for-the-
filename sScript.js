'use strict';
var sScript = {
	collide(pos) {
		var collisions = {
			up: false,
			down: false,
			left: false,
			right: false
		};

		var push = {
			gen: function (xy, rev, dir) { // rev stands for reverse
				const TS = xy == 'x' ? TILE_WIDTH : TILE_HEIGHT;
				return function (pos, hpos, tile, tpos) {
					let i = Math[rev ? 'ceil' : 'floor']((pos[xy] + hpos[xy]) / TS) * TS - hpos[xy];
					if (
						(rev ? pos : pos.last)[xy] <= i &&
						(rev ? pos.last : pos)[xy] >= i
					) {
						pos[xy] = i;
						pos[xy + 'v'] = 0;
						collisions[dir] = true;
						if (tile.onCollide) tile.onCollide(dir, tpos, null);
					}
					return pos;
				};
			}
		};
		push.up = push.gen('y', false, 'up');
		push.down = push.gen('y', true, 'down');
		push.left = push.gen('x', false, 'left');
		push.right = push.gen('x', true, 'right');

		function pushif(dir, x, y) {
			let t = sScript.getTile(pos.x + x, pos.y + y, true);
			if (t.tile.collide && (typeof t.tile.collide != 'object' || t.tile.collide[dir]))
				pos = push[dir](pos, { x, y }, t.tile, t.pos);
		}

		let pushlist = [];
		for (let h of pos.hitboxes) {
			for (let x = h.x; x < h.width; x += TILE_WIDTH)
				pushlist.push(['down', x, h.y], ['up', x, h.height]);
			pushlist.push(['down', h.width, h.y], ['up', h.width, h.height]);
			for (let y = h.y; y < h.height; y += TILE_HEIGHT)
				pushlist.push(['right', h.x, y], ['left', h.width, y]);
			pushlist.push(['right', h.x, h.height], ['left', h.width, h.height]);
		}

		for (let p of pushlist)
			pushif(...p);

		pos.collisions = collisions;
		return pos;
	},

	move(pos, input, op = {}) {
		op = Object.assign(op, { // add default setting for op
			xs: 1,
			ys: 1,
			xg: false,
			yg: true,
			friction: 1.1,
			jump: -3
		});

		if (op.xg) {
			let flip = op.xs > 0;
			let side = flip ? 'left' : 'right';
			if (pos.collisions[side] && input[side]) pos.xv = op.jump; //jump
			pos.xv += op.xs * (0.1 - (input[side] * Math.max(-1 - pos.xv * (flip ? 1 : -1), 0) / 30)); // gravity is reduced on ascent while holding up for higher jumps
		} else {
			if (input.left) // walk/run
				pos.xv -= (.1 + keyInput.sprint * .05) * op.xs;
			if (input.right)
				pos.xv += (.1 + keyInput.sprint * .05) * op.xs;
		}
		if (op.yg) {
			let flip = op.ys > 0;
			let side = flip ? 'up' : 'down';
			if (pos.collisions[side] && input[side]) pos.yv = op.jump;
			pos.yv += op.ys * (0.1 - (input[side] * Math.max(-1 - pos.yv * (flip ? 1 : -1), 0) / 30));
		} else {
			if (input.up) // walk/run
				pos.yv -= (.1 + input.sprint * .05) * op.ys;
			if (input.down)
				pos.yv += (.1 + input.sprint * .05) * op.ys;
		}

		pos.y += pos.yv;
		pos.x += pos.xv;
		if (!op.xg) pos.xv /= op.friction;
		if (!op.yg) pos.yv /= op.friction;

		return pos;
	},

	convertCoords(x, y, s) {
		if (s) return { x: x * TILE_WIDTH, y: y * TILE_HEIGHT }; // tile to sprite
		else return { x: Math.floor(x / TILE_WIDTH), y: Math.floor(y / TILE_HEIGHT) }; // sprite to tile
	},

	getTile(x, y, s = false, d = 0) {
		let p;
		if (s) p = sScript.convertCoords(x, y, false); // sprite coords
		else p = { x, y }; // tile coords

		let t;
		if (
			p.x >= 0 &&
			p.y >= 0 &&
			p.x < level.width &&
			p.y < level.height
		) t = tile[level.tiles[p.y][p.x]];
		else t = tile[0];
		return { tile: t, pos: { x: p.x, y: p.y } };
	},

	setTile(x, y, t, s = false) {
		let p;
		if (s) p = sScript.convertCoords(x, y, false); // sprite coords
		else p = { x, y }; // tile coords

		if (
			p.x >= 0 &&
			p.y >= 0 &&
			p.x < level.width &&
			p.y < level.height
		) {
			level.tiles[p.y][p.x] = t;
			return true;
		} else return false;
	},
};
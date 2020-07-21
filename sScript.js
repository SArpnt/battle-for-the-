'use strict';
var sScript = {
	collide(pos, cPos = true, cVel = cPos, tCol = cPos || cVel) {
		var collisions = {
			up: false,
			down: false,
			left: false,
			right: false
		};

		var push = {
			gen: function (xy, rev, dir) { // this function is used to make a push function for every direction
				const TS = xy == 'x' ? TILE_WIDTH : TILE_HEIGHT;
				return function (pos, hpos, tile, tpos) { // the push function itself, sends player to tile edge if they have passed through it
					let i = Math[rev ? 'ceil' : 'floor']((pos[xy] + hpos[xy]) / TS) * TS - hpos[xy];
					if (
						(rev ? pos : pos.last)[xy] <= i &&
						(rev ? pos.last : pos)[xy] >= i
					) {
						if (cPos) pos[xy] = i;
						if (cVel) pos[xy + 'v'] = 0;
						collisions[dir] = true;
						if (tCol && tile.onCollide) tile.onCollide(dir, tpos, null);
					}
					return pos;
				};
			}
		};
		push.up = push.gen('y', false, 'up'); // generate push scripts for every direction
		push.down = push.gen('y', true, 'down');
		push.left = push.gen('x', false, 'left');
		push.right = push.gen('x', true, 'right');

		function pushif(dir, x, y, xf, yf) { // push if tile collision is enabled and get information for push functions
			if (xf && (pos.x + x) % 16 == 0) x -= TILE_WIDTH; // fix rounding issues
			if (yf && (pos.y + y) % 16 == 0) y -= TILE_HEIGHT;

			let t = sScript.getTile(pos.x + x, pos.y + y, true);
			if (t.tile.collide && (typeof t.tile.collide != 'object' || t.tile.collide[dir]))
				pos = push[dir](pos, { x, y }, t.tile, t.pos);
		}

		let pushPoints = [];
		for (let h of pos.hitboxes) { // make points along all hitbox edges to test
			let c = h.collide || { up: true, down: true, left: true, right: true };

			if (c.up || c.down) {
				for (let x = h.x; x < h.width; x += TILE_WIDTH) {
					if (c.down) pushPoints.push(['down', x, h.y]);
					if (c.up) pushPoints.push(['up', x, h.height]);
				}
				if (c.down) pushPoints.push(['down', h.width - 1, h.y, true]); // these booleans mark to fix rounding issues
				if (c.up) pushPoints.push(['up', h.width - 1, h.height, true]);
			}
			if (c.left || c.right) {
				for (let y = h.y; y < h.height; y += TILE_HEIGHT) {
					if (c.right) pushPoints.push(['right', h.x, y]);
					if (c.left) pushPoints.push(['left', h.width, y]);
				}
				if (c.right) pushPoints.push(['right', h.x, h.height - 1, false, true]);
				if (c.left) pushPoints.push(['left', h.width, h.height - 1, false, true]);
			}
		}

		let sortOrder = { up: 0, left: 1, right: 2, down: 3 };
		pushPoints.sort((a, b) => (sortOrder[a] - sortOrder[b])); // make collision order floors, then walls, then ceilings

		for (let p of pushPoints) // test all pushPoints
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
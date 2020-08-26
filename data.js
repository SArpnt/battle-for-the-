'use strict';
TILE_WIDTH = 8;
TILE_HEIGHT = 8;

compressedLevel = {
	width: 54,
	height: 30,
	assets: [0, 1],
	sprites: [
		['Player', 64, 152],
		['enemy.Spider', 96, 160],
	],
	tiles: [
		{ id: 1, x: 0, y: 0, xe: 13, ye: 29 },
		{ id: 1, x: 14, y: 24, xe: 42, ye: 29 },
		{ id: 1, x: 14, y: 23, xe: 17 },
		{ id: 0, x: 8, y: 14, xe: 14, ye: 21 },
		{ id: 3, x: 0, y: 13, xe: 13 },
		{ id: 4, x: 7, y: 19, ye: 21 },
		{ id: 2, x: 4, y: 22, xe: 16 },
		{ id: 2, x: 18, y: 24, xe: 41 },
		{ id: 6, x: 17, y: 22 },
		{ id: 4, x: 17, y: 23 },
		{ id: 6, x: 42, y: 24 },
		{ id: 4, x: 42, y: 25, ye: 29 },
		{ id: 5, x: 36, y: 18, ye: 23 },
		{ id: 2, x: 23, y: 16, xe: 29 },
		{ id: 2, x: 1, y: 2, xe: 2 },
		{ id: 2, x: 6, y: 8, xe: 7 },
		{ id: 2, x: 12, y: 10, xe: 13 },
		{ id: 10, x: 26, y: 8 },
	]
};

tile = [
	{
		name: 'empty',
		img: [1, 0, 0],
	},
	{
		name: 'dirt',
		img: [1, 2, 1],
		collide: false,
	},
	{
		name: 'floor',
		img: [1, 2, 0],
		collide: {
			up: true,
			down: false,
			left: false,
			right: false
		}
	},
	{
		name: 'ceiling',
		img: [1, 2, 2],
		collide: {
			up: false,
			down: true,
			left: false,
			right: false
		}
	},
	{
		name: 'Rwall',
		img: [1, 3, 1],
		collide: {
			up: false,
			down: false,
			left: false,
			right: true
		}
	},
	{
		name: 'Lwall',
		img: [1, 1, 1],
		collide: {
			up: false,
			down: false,
			left: true,
			right: false
		}
	},
	{
		name: 'RUcorner',
		img: [1, 3, 0],
		collide: {
			up: true,
			down: false,
			left: false,
			right: true
		}
	},
	{
		name: 'LUcorner',
		img: [1, 1, 0],
		collide: {
			up: true,
			down: false,
			left: true,
			right: false
		}
	},
	{
		name: 'RDcorner',
		img: [1, 3, 2],
		collide: {
			up: false,
			down: true,
			left: false,
			right: true
		}
	},
	{
		name: 'LDcorner',
		img: [1, 1, 2],
		collide: {
			up: false,
			down: true,
			left: true,
			right: false
		}
	},
	{
		name: 'bumpBox',
		img: [1, 0, 1],
		collide: true,
		onCollide(side, pos, s) {
			if (side == 'down') {
				sScript.setTile(pos.x, pos.y, 0, false);
				cSprites.push(new sprite.tile.Bump(pos.x, pos.y, 10, side));
			}
		}
	}
];

function fireGun(num = 1, cooldown = 6, spread = .05) {
	this.shoot = this.shoot || {};
	if (this.shoot.cooldown) {
		this.shoot.cooldown--;
		return false;
	}
	for (let i = 0; i < num; i++)
		cSprites.push(new sprite.Bullet(
			this.pos.x + this.shoot.offset.x,
			this.pos.y + this.shoot.offset.y,
			(Math.PI / 2) + (Math.random() - .5) * spread)
		);
	this.shoot.cooldown = cooldown;
	return true;
}

sprite = {
	Player: class {
		constructor(x, y) {
			this.pos = {
				x: x,
				y: y,
				xv: 0,
				yv: 0,
				collisions: {
					up: false,
					down: false,
					left: false,
					right: false
				},
				hitboxes: [
					new sScript.hitbox.Rect(0, 0, 16, 24),
				],
			};
			this.shoot = {
				offset: { x: 12, y: 12 }
			};
			this.scrollState = 0; // 1 is right
			this.img = [0, 0, 0, 16, 24];
		}

		update(dt, sN) {
			this.pos.last = Object.assign({}, this.pos);
			delete this.pos.last.last;
			this.pos = sScript.move(this.pos, dt, keyInput);
			this.pos = sScript.collide(this.pos);

			{
				if ((() => {
					switch (this.scrollState) { // reset scrolling when changing direction partly
						case 1:
							return this.pos.xv < 0;
						case -1:
							return this.pos.xv > 0;
						default:
							return false;
					}
				})()) this.scrollState = 0;

				let i = (this.pos.x + scrollX) / ctx.canvas.width; // player screen position from 0-1

				if (i > ((this.scrollState == 1) ? .375 : .75)) // past scroll border
					this.scroll(1, 120);
				else if (i < ((this.scrollState == -1) ? .625 : .25))
					this.scroll(-1, 184);
			}
			if (keyInput.sprint) fireGun.call(this, 1, 6, .05);
		}

		scroll(state, a) {
			this.scrollState = state;

			scrollX += ( // scroll camera to final position based on movement
				(a - this.pos.x - scrollX) // final camera position
					> 0 ? Math.max : Math.min)(this.pos.xv * -1.4, 0);

			if ( // jitter fix
				state == 1 ?
					this.pos.x + scrollX < a :
					this.pos.x + scrollX > a
			)
				scrollX = a - this.pos.x;
		}

	},
	enemy: {
		Spider: class {
			constructor(x, y) {
				this.pos = {
					x: x,
					y: y,
					xv: 0,
					yv: 0,
					collisions: {
						up: false,
						down: false,
						left: false,
						right: false
					},
					hitboxes: [
						new sScript.hitbox.Rect(0, 0, 24, 16),
					],
				};
				this.dir = true; // true = right
				this.img = [0, 0, 24, 24, 16];
			}

			update(dt, sN) {
				this.pos.last = Object.assign({}, this.pos);
				delete this.pos.last.last;
				this.pos = sScript.move(this.pos, dt,
					{ up: false, down: false, left: !this.dir, right: this.dir, sprint: false }
				);

				this.pos = sScript.collide(this.pos);
				if (this.pos.collisions.right || this.pos.collisions.left)
					this.dir = !this.dir;
			}
		},
	},
	Bullet: class {
		constructor(x, y, dir, speed = .5) {
			this.pos = {
				x: x,
				y: y,
				xv: Math.sin(dir) * speed,
				yv: Math.cos(dir) * speed,
			};
			this.timer = 0;
			this.img = [0, 32, 0, 8, 8];
		}
		update(dt, sN) {
			this.pos.x += dt * this.pos.xv;
			this.pos.y += dt * this.pos.yv;
			if (this.timer >= 4000) {
				cSprites.splice(sN, 1);
				return;
			}
			this.timer += dt;
		}
	},
	particle: {
		Star: class {
			constructor(x, y) {
				this.pos = {
					x: x,
					y: y,
				};
				this.timer = 0;
				this.img = [0, 32, 0, 8, 8];
			}
			update(dt, sN) {
				if (this.timer >= 200) {
					cSprites.splice(sN, 1);
					return;
				}
				//this.img.style = "opacity:" + (1 - (this.timer / 10))
				this.timer += dt;
			}
		}
	},
	tile: {
		Bump: class {
			constructor(x, y, t, side) {
				this.pos = {
					tx: x,
					ty: y,
					x: x * TILE_WIDTH,
					y: y * TILE_HEIGHT,
					sy: y * TILE_HEIGHT,
					yv: -.6
				};
				this.tile = t;
				this.side = side;
				let i = tile[t].img;
				this.img = [i[0], i[1] * TILE_WIDTH, i[2] * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT];
			}
			update(dt, sN) {
				var p = this.pos;
				p.y += p.yv;
				p.yv += .01 * dt;
				if (p.y >= p.sy) {
					sScript.setTile(p.tx, p.ty, this.tile, false);
					cSprites.splice(sN, 1);
				}
			}
		}
	}
};
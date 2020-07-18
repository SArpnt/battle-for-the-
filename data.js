'use strict'
var scrollX = 0;
var scrollY = 0;

var compressedLevel = {
	x: 27,
	y: 15,
	tiles: [
		{ id: 1, x: 0, y: 0, xe: 6, ye: 14 },
		{ id: 1, x: 7, y: 12, xe: 21, ye: 14 },
		{ id: 0, x: 4, y: 7, xe: 6, ye: 10 },
		{ id: 3, x: 0, y: 6, xe: 6 },
		{ id: 4, x: 3, y: 9, ye: 10 },
		{ id: 2, x: 2, y: 11, xe: 8 },
		{ id: 2, x: 10, y: 12, xe: 20 },
		{ id: 6, x: 9, y: 11 },
		{ id: 6, x: 21, y: 12 },
		{ id: 4, x: 21, y: 13, ye: 14 },
		{ id: 5, x: 18, y: 9, ye: 11 },
		{ id: 2, x: 12, y: 8, xe: 14 },
		{ id: 2, x: 1, y: 1 },
		{ id: 2, x: 3, y: 4 },
		{ id: 2, x: 6, y: 5 },
		{ id: 10, x: 13, y: 4 }
	]
};
function loadLevel(data, background = 0) {
	var level = [];
	for (let y = 0; y < data.y; y++)
		level.push(Object.assign([], Array(data.x).fill(background)));
	for (let i = 0; i < data.tiles.length; i++) {
		let rect = data.tiles[i];
		if (rect.xe === undefined) rect.xe = rect.x;
		if (rect.ye === undefined) rect.ye = rect.y;
		for (let y = rect.y; y <= rect.ye; y++)
			for (let x = rect.x; x <= rect.xe; x++)
				level[y][x] = rect.id;
	}
	return level;
}
var level = loadLevel(compressedLevel);
console.log(level);

const tile = [
	{
		name: 'empty',
		collide: {
			up: false,
			down: false,
			left: false,
			right: false
		}
	},
	{
		name: 'dirt',
		collide: {
			up: false,
			down: false,
			left: false,
			right: false
		}
	},
	{
		name: 'floor',
		collide: {
			up: true,
			down: false,
			left: false,
			right: false
		}
	},
	{
		name: 'ceiling',
		collide: {
			up: false,
			down: true,
			left: false,
			right: false
		}
	},
	{
		name: 'Rwall',
		collide: {
			up: false,
			down: false,
			left: false,
			right: true
		}
	},
	{
		name: 'Lwall',
		collide: {
			up: false,
			down: false,
			left: true,
			right: false
		}
	},
	{
		name: 'RUcorner',
		collide: {
			up: true,
			down: false,
			left: false,
			right: true
		}
	},
	{
		name: 'LUcorner',
		collide: {
			up: true,
			down: false,
			left: true,
			right: false
		}
	},
	{
		name: 'RDcorner',
		collide: {
			up: false,
			down: true,
			left: false,
			right: true
		}
	},
	{
		name: 'LDcorner',
		collide: {
			up: false,
			down: true,
			left: true,
			right: false
		}
	},
	{
		name: 'bumpBox',
		collide: {
			up: true,
			down: true,
			left: true,
			right: true
		},
		onCollide: function (side, pos, s) {
			if (side == 'down') {
				level[pos.y][pos.x] = 0;
				cSprites.push(new sprite.tile.bump(pos.x, pos.y, 10, side));
			}
		}
	}
];

const sprite = {
	player: class {
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
				}
			};
			this.scrollState = 0; //1 is right
			this.img = getImg('sprite', 'player');
		}

		update(sN) {
			this.pos.last = Object.assign({}, this.pos);
			delete this.pos.last.last;
			this.pos = sScript.move(this.pos, keyInput);
			this.pos = sScript.collide(this.pos);

			{
				if ((() => {
					switch (this.scrollState) { //reset scrolling when changing direction partly
						case 1:
							return this.pos.xv < 0;
						case -1:
							return this.pos.xv > 0;
						default:
							return false;
					}
				})()) this.scrollState = 0;

				let i = this.pos.x + scrollX; //player relative to camera

				if (i > ((this.scrollState == 1) ? 120 : 232)) //past scroll border
					this.scroll(1, 120);
				else if (i < ((this.scrollState == -1) ? 184 : 72))
					this.scroll(-1, 184);
			}
			cSprites.push(new sprite.test(this.pos.x, this.pos.y + 8));
		}

		scroll(state, a) {
			this.scrollState = state;

			scrollX += (//scroll camera to final position based on movement
				(a - this.pos.x - scrollX) //final camera position
					> 0 ? Math.max : Math.min)(this.pos.xv * -2.5, 0);

			if (//jitter fix
				state == 1 ?
					this.pos.x + scrollX < a :
					this.pos.x + scrollX > a
			)
				scrollX = a - this.pos.x;
		}

	},
	enemy: class {
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
				}
			};
			this.dir = true; //true = right
			this.img = getImg('sprite', 'enemy');
		}

		update(sN) {
			this.pos.last = Object.assign({}, this.pos);
			delete this.pos.last.last;
			this.pos = sScript.move(this.pos,
				{ up: false, down: false, left: !this.dir, right: this.dir, sprint: false }
			);

			this.pos = sScript.collide(this.pos);
			if (this.pos.collisions.right || this.pos.collisions.left)
				this.dir = !this.dir;
		}
	},
	test: class {
		constructor(x, y) {
			this.pos = {
				x: x,
				y: y
			};
			this.timer = 0;
			this.img = getImg('sprite', 'test');
		}
		update(sN) {
			if (this.timer >= 5) {
				cSprites.splice(sN, 1);
				return;
			}
			//this.img.style = "opacity:" + (1 - (this.timer / 10))
			this.timer++;
		}
	},
	tile: {
		bump: class {
			constructor(x, y, t, side) {
				this.pos = {
					tx: x,
					ty: y,
					x: x * 16,
					y: y * 16,
					sy: y * 16,
					yv: -1.5
				};
				this.tile = t;
				this.side = side;
				this.img = tile[t].img;
			}
			update(sN) {
				var p = this.pos;
				p.y += p.yv;
				p.yv += 0.2;
				if (p.y == p.sy) {
					level[p.ty][p.tx] = this.tile;
					cSprites.splice(sN, 1);
				}
			}
		}
	}
};

function getImg(type, img) {
	let i = document.createElement('img');
	i.src = `assets/${type}/${img}.png`;
	return i;
}

for (let t of tile)
	t.img = getImg('tile', t.name);
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD: import SeeBattle from "sea-battle";
        define(['sea-battle'], factory);
    } else {
        // globals: window.SeeBattle
        root.SeeBattle = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * @constructor
     * @param {string} gameAreaId
     * @return {SeeBattle}
     */
    function SeeBattle(gameAreaId) {
        this.gameFieldBorderX = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.gameFieldBorderY = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        this.gameArea = document.getElementById(gameAreaId);
        this.gameArea.innerHTML = "";
        this.shipsConfiguration = [
            { maxShips: 1, pointCount: 4 },
            { maxShips: 2, pointCount: 3 },
            { maxShips: 3, pointCount: 2 },
            { maxShips: 4, pointCount: 1 }
        ];
        this.userName = null;
        this.pcName = null;
        this.pcDelay = 800;

        this._hitsForWin = 0;
        for (var i = 0; i < this.shipsConfiguration.length; i++) {
            this._hitsForWin = +this._hitsForWin + (this.shipsConfiguration[i].maxShips * this.shipsConfiguration[i].pointCount);
        }

        this._pcShipsMap = null;
        this._userShipsMap = null;
        this._gameStopped = false;

        this.CELL_WITH_SHIP = 1;
        this.CELL_EMPTY = 0;

        /**
         * Html elements
         */
        this.pcInfo = null;
        this.userInfo = null;
        this.toolbar = null;
        this.startGameButton = null;
        this.pcGameField = null;
        this.userGameField = null;
    }

    SeeBattle.prototype = {
        /**
         * Calls functions that insert basic html markup
         * necessary for the game
         */
        run: function () {
            this.createToolbar();
            this.createGameFields();
            this.createFooter();
        },
        createToolbar: function () {
            this.toolbar = document.createElement('div');
            this.toolbar.setAttribute('class', 'toolbar');
            this.gameArea.appendChild(this.toolbar);
        },
        createGameFields: function () {
            var pcGameArea = document.createElement('div');
            pcGameArea.setAttribute('class', 'pcGameArea');
            this.gameArea.appendChild(pcGameArea);

            var userGameArea = document.createElement('div');
            userGameArea.setAttribute('class', 'userGameArea');
            this.gameArea.appendChild(userGameArea);

            this.pcInfo = document.createElement('div');
            pcGameArea.appendChild(this.pcInfo);

            this.userInfo = document.createElement('div');
            userGameArea.appendChild(this.userInfo);

            this.pcGameField = document.createElement('div');
            this.pcGameField.setAttribute('class', 'gameField');
            this.userGameField = document.createElement('div');
            this.userGameField.setAttribute('class', 'gameField');
            pcGameArea.appendChild(this.pcGameField);
            userGameArea.appendChild(this.userGameField);
        },
        createFooter: function () {
            var footer = document.createElement('div');
            footer.setAttribute('class', 'footer');

            this.startGameButton = document.createElement('button');
            this.startGameButton.innerHTML = 'Start the game';
            this.startGameButton.setAttribute('class', 'btn');
            this.startGameButton.onclick = function () {
                this.startNewGame();
            }.bind(this);
            footer.appendChild(this.startGameButton);

            this.gameArea.appendChild(footer);
        },
        startNewGame: function () {
            this.userName = this.userName || prompt('Your name?', '');
            this.pcName = this.pcName || prompt('Enemy name', '');

            if (!this.userName || !this.pcName) {
                alert('The name was entered incorrectly');
                return;
            }

            this.startGameButton.innerHTML = 'Start again...';
            this.pcInfo.innerHTML = this.pcName + ' (your opponent)';
            this.userInfo.innerHTML = this.userName + ' (your field)';

            this._pcShipsMap = this.generateRandomShipMap();
            this._userShipsMap = this.generateRandomShipMap();
            this._pcShotMap = this.generateShotMap();
            this._userHits = 0;
            this._pcHits = 0;
            this._blockHeight = null;
            this._gameStopped = false;
            this._pcGoing = false;

            this.drawGamePoints();
            this.updateToolbar();
        },

        /**
         * Creation/update of cells in game fields
         */
        drawGamePoints: function () {
            for (var yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
                for (var xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
                    var pcPointBlock = this.getOrCreatePointBlock(yPoint, xPoint);
                    pcPointBlock.onclick = function (e) {
                        this.userFire(e);
                    }.bind(this);
                    // if you need to display computer ships
                    /*if(this._pcShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP){
                        pcPointBlock.setAttribute('class', 'ship');
                    }*/

                    var userPointBlock = this.getOrCreatePointBlock(yPoint, xPoint, 'user');
                    if (this._userShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP) {
                        userPointBlock.setAttribute('class', 'ship');
                    }
                }
            }
        },

        /**
         * Height of the cell obtained from the width value
         * @type {type}
         */
        _blockHeight: null,

        /**
         * Creates or resets the values of cells where ships are placed
         * @return {type}
         */
        getOrCreatePointBlock: function (yPoint, xPoint, type) {
            var id = this.getPointBlockIdByCoords(yPoint, xPoint, type);
            var block = document.getElementById(id);
            if (block) {
                block.innerHTML = '';
                block.setAttribute('class', '');
            } else {
                block = document.createElement('div');
                block.setAttribute('id', id);
                block.setAttribute('data-x', xPoint);
                block.setAttribute('data-y', yPoint);
                if (type && type === 'user') {
                    this.userGameField.appendChild(block);
                } else {
                    this.pcGameField.appendChild(block);
                }
            }
            block.style.width = (100 / this.gameFieldBorderY.length) + '%';
            if (!this._blockHeight) {
                this._blockHeight = block.clientWidth;
            }
            block.style.height = this._blockHeight + 'px';
            block.style.lineHeight = this._blockHeight + 'px';
            block.style.fontSize = this._blockHeight + 'px';
            return block;
        },

        /**
         * Returns the id of the game cell, generated based on coordinates
         * and type of game field
         * @param {type} yPoint
         * @param {type} xPoint
         * @param {type} type
         * @return {String}
         */
        getPointBlockIdByCoords: function (yPoint, xPoint, type) {
            if (type && type === 'user') {
                return 'user_x' + xPoint + '_y' + yPoint;
            }
            return 'pc_x' + xPoint + '_y' + yPoint;
        },

        /**
         * Generates an array with coordinates of fields, from which the computer
         * randomly selects coordinates for firing
         * @return {Array|SeeBattle.prototype.generateShotMap.map}
         */
        generateShotMap: function () {
            var map = [];
            for (var yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
                for (var xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
                    map.push({ y: yPoint, x: xPoint });
                }
            }
            return map;
        },

        /**
         * Generates an array containing information about whether there is a ship or not
         * @return {Array}
         */
        generateRandomShipMap: function () {
            var map = [];
            // generation of the location map, including negative coordinates
            // for the possibility of placement at the borders
            for (var yPoint = -1; yPoint < (this.gameFieldBorderY.length + 1); yPoint++) {
                for (var xPoint = -1; xPoint < (this.gameFieldBorderX.length + 1); xPoint++) {
                    if (!map[yPoint]) {
                        map[yPoint] = [];
                    }
                    map[yPoint][xPoint] = this.CELL_EMPTY;
                }
            }

            // getting a copy of the ship settings for further manipulation
            var shipsConfiguration = JSON.parse(JSON.stringify(this.shipsConfiguration));
            var allShipsPlaced = false;
            while (allShipsPlaced === false) {
                var xPoint = this.getRandomInt(0, this.gameFieldBorderX.length);
                var yPoint = this.getRandomInt(0, this.gameFieldBorderY.length);
                if (this.isPointFree(map, xPoint, yPoint) === true) {
                    if (this.canPutHorizontal(map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderX.length)) {
                        for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
                            map[yPoint][xPoint + i] = this.CELL_WITH_SHIP;
                        }
                    } else if (this.canPutVertical(map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderY.length)) {
                        for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
                            map[yPoint + i][xPoint] = this.CELL_WITH_SHIP;
                        }
                    } else {
                        continue;
                    }

                    // updating ship settings if the loop was not skipped
                    // and the ship was actually placed
                    shipsConfiguration[0].maxShips--;
                    if (shipsConfiguration[0].maxShips < 1) {
                        shipsConfiguration.splice(0, 1);
                    }
                    if (shipsConfiguration.length === 0) {
                        allShipsPlaced = true;
                    }
                }
            }
            return map;
        },
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },

        /**
         * Check if it is possible to place a one-deck ship here
         * @param {type} map
         * @param {type} xPoint
         * @param {type} yPoint
         * @return {Boolean}
         */
        isPointFree: function (map, xPoint, yPoint) {
            // current and further clockwise around
            if (map[yPoint][xPoint] === this.CELL_EMPTY
                && map[yPoint - 1][xPoint] === this.CELL_EMPTY
                && map[yPoint - 1][xPoint + 1] === this.CELL_EMPTY
                && map[yPoint][xPoint + 1] === this.CELL_EMPTY
                && map[yPoint + 1][xPoint + 1] === this.CELL_EMPTY
                && map[yPoint + 1][xPoint] === this.CELL_EMPTY
                && map[yPoint + 1][xPoint - 1] === this.CELL_EMPTY
                && map[yPoint][xPoint - 1] === this.CELL_EMPTY
                && map[yPoint - 1][xPoint - 1] === this.CELL_EMPTY
            ) {
                return true;
            }
            return false;
        },

        /**
 * Possible insertion of a ship horizontally
 * @param {type} map
 * @param {type} xPoint
 * @param {type} yPoint
 * @param {type} shipLength
 * @param {type} coordLength
 * @return {Boolean}
 */
        canPutHorizontal: function (map, xPoint, yPoint, shipLength, coordLength) {
            var freePoints = 0;
            for (var x = xPoint; x < coordLength; x++) {
                // current and clockwise points in the horizontal direction
                if (
                    map[yPoint][x] === this.CELL_EMPTY &&
                    map[yPoint - 1][x] === this.CELL_EMPTY &&
                    map[yPoint - 1][x + 1] === this.CELL_EMPTY &&
                    map[yPoint][x + 1] === this.CELL_EMPTY &&
                    map[yPoint + 1][x + 1] === this.CELL_EMPTY &&
                    map[yPoint + 1][x] === this.CELL_EMPTY
                ) {
                    freePoints++;
                } else {
                    break;
                }
            }
            return freePoints >= shipLength;
        },

        /**
         * Possible insertion of a ship vertically
         * @param {type} map
         * @param {type} xPoint
         * @param {type} yPoint
         * @param {type} shipLength
         * @param {type} coordLength
         * @return {Boolean}
         */
        canPutVertical: function (map, xPoint, yPoint, shipLength, coordLength) {
            var freePoints = 0;
            for (var y = yPoint; y < coordLength; y++) {
                // current and clockwise points in the vertical direction
                if (
                    map[y][xPoint] === this.CELL_EMPTY &&
                    map[y + 1][xPoint] === this.CELL_EMPTY &&
                    map[y + 1][xPoint + 1] === this.CELL_EMPTY &&
                    map[y + 1][xPoint] === this.CELL_EMPTY &&
                    map[y][xPoint - 1] === this.CELL_EMPTY &&
                    map[y - 1][xPoint - 1] === this.CELL_EMPTY
                ) {
                    freePoints++;
                } else {
                    break;
                }
            }
            return freePoints >= shipLength;
        },

        /**
         * Click handler on a cell
         * @param {type} e
         */
        userFire: function (event) {
            if (this.isGameStopped() || this.isPCGoing()) {
                return;
            }
            var e = event || window.event;
            var firedEl = e.target || e.srcElement;
            var x = firedEl.getAttribute('data-x');
            var y = firedEl.getAttribute('data-y');
            if (this._pcShipsMap[y][x] === this.CELL_EMPTY) {
                firedEl.innerHTML = this.getFireFailTemplate();
                this.prepareToPcFire();
            } else {
                firedEl.innerHTML = this.getFireSuccessTemplate();
                firedEl.setAttribute('class', 'ship');
                this._userHits++;
                this.updateToolbar();
                if (this._userHits >= this._hitsForWin) {
                    this.stopGame();
                }
            }
            firedEl.onclick = null;
        },
        _pcGoing: false,
        isPCGoing: function () {
            return this._pcGoing;
        },

        /**
         * Creates a delay before the computer's move
         * necessary to have time to see whose move it is
         */
        prepareToPcFire: function () {
            this._pcGoing = true;
            this.updateToolbar();
            setTimeout(
                function () {
                    this.pcFire();
                }.bind(this),
                this.pcDelay
            );
        },

        /**
         * Computer's shot
         */
        pcFire: function () {
            if (this.isGameStopped()) {
                return;
            }
            // takes a random shot from the previously generated map
            var randomShotIndex = this.getRandomInt(0, this._pcShotMap.length);
            var randomShot = JSON.parse(JSON.stringify(this._pcShotMap[randomShotIndex]));
            // removal to avoid repeated shots
            this._pcShotMap.splice(randomShotIndex, 1);

            var firedEl = document.getElementById(this.getPointBlockIdByCoords(randomShot.y, randomShot.x, 'user'));
            if (this._userShipsMap[randomShot.y][randomShot.x] === this.CELL_EMPTY) {
                firedEl.innerHTML = this.getFireFailTemplate();
            } else {
                firedEl.innerHTML = this.getFireSuccessTemplate();
                this._pcHits++;
                this.updateToolbar();
                if (this._pcHits >= this._hitsForWin) {
                    this.stopGame();
                } else {
                    this.prepareToPcFire(); 
                }
            }
            this._pcGoing = false;
            this.updateToolbar();
        },
        /**
         * Stops the game
         */
        stopGame: function () {
            this._gameStopped = true;
            this._pcGoing = false;
            this.startGameButton.innerHTML = 'Should I play again?';
            this.updateToolbar();
        },
        isGameStopped: function () {
            return this._gameStopped;
        },
        getFireSuccessTemplate: function () {
            return '💥';
        },
        getFireFailTemplate: function () {
            return '⚙';
        },

        /**
         * Displays the current game situation in the block
         */
        updateToolbar: function () {
            this.toolbar.innerHTML = 'Check - ' + this._pcHits + ':' + this._userHits;
            if (this.isGameStopped()) {
                if (this._userHits >= this._hitsForWin) {
                    this.toolbar.innerHTML += ', you won';
                } else {
                    this.toolbar.innerHTML += ', your opponent won';
                }
            } else if (this.isPCGoing()) {
                this.toolbar.innerHTML += ', your opponent is walking';
            } else {
                this.toolbar.innerHTML += ', now it\'s your turn';
            }
        },
    };

    return SeeBattle;
}));
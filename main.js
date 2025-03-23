import Phaser from 'phaser'

const size = {
    width: 500,
    height: 700
}

const speedDown = 750;

const canvas = document.querySelector('#gameCanvas');
const gameStartDiv = document.querySelector('#gameStartDiv');
const gameStartBtn = document.querySelector('#gameStartBtn');
const gameEndDiv = document.querySelector('#gameEndDiv');
const gameWinLoseSpan = document.querySelector('#gameWinLoseSpan');
const gameEndScoreSpan = document.querySelector('#gameEndScoreSpan');

class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.player = null;
        this.cursor = null;
        this.playerSpeed = speedDown + 50;
        this.target = null;
        this.points = 0;
        this.textScore = null;
        this.textTime = null;
        this.timedEvent = null;
        this.remainingTime = 0;
        this.coinMusic = null;
        this.bgMusic = null;
        this.emitter = null;
    }

    preload() {
        this.load.image("bg", "/assets/bg.png");
        this.load.image("colet", "/assets/colet.png");
        this.load.image("cherry", "/assets/cherry.png");
        this.load.image("confetti", "/assets/confetti.png");
        this.load.audio("coin", "/assets/coin.mp3");
        this.load.audio("bgMusic", "/assets/bgMusic.mp3");
        this.load.image("trash", "/assets/trash.png");
    }

    create() {
        this.coinMusic = this.sound.add("coin");
        this.bgMusic = this.sound.add("bgMusic");
        this.bgMusic.play();

        this.add.image(0, 0, "bg").setOrigin(0, 0);

        this.target = this.physics.add.image(0, 0, "cherry").setOrigin(0, 0);
        this.target.setMaxVelocity(0, speedDown);

        this.player = this.physics.add.image(0, size.height - 100, "colet").setOrigin(0, 0);
        this.player.setImmovable(true);
        this.player.body.allowGravity = false;
        this.player.setCollideWorldBounds(true);
        this.player.setSize(
            this.player.width - this.player.width / 4,
            this.player.height / 6
        ).setOffset(this.player.width / 10, this.player.height - this.player.height / 10);

        this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);

        this.cursor = this.input.keyboard.createCursorKeys();

        this.textScore = this.add.text(size.width - 120, 10, "Score: 0", {
            font: "25px Arial",
            fill: "#000000"
        });

        this.textTime = this.add.text(20, 10, "Remaining Time: 00", {
            font: "25px Arial",
            fill: "#000000"
        });

        this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);

        this.emitter = this.add.particles(0, 0, "confetti", {
            speed: 100,
            gravityY: speedDown - 200,
            scale: 0.04,
            duration: 100,
            emitting: false
        });
        this.emitter.startFollow(this.player, this.player.width / 2, this.player.height / 2, true);

        this.time.addEvent({
            delay: 1000,
            callback: this.spawnTrash,
            callbackScope: this,
            loop: true
        });
    }

    spawnTrash() {
        let trash = this.physics.add.image(this.getRandomX(), 0, 'trash').setOrigin(0, 0);
        trash.setVelocityY(200);
        this.physics.add.overlap(this.player, trash, this.collectTrash, null, this);
    }

    collectTrash(player, trash) {
        trash.destroy();
        this.gameOver();
    }

    getRandomX() {
        return Math.floor(Math.random() * size.width);
    }

    update() {
        this.remainingTime = this.timedEvent.getRemainingSeconds();
        this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime)}`);

        if (this.target.y >= size.height) {
            this.gameOver();
        }

        const { left, right } = this.cursor;

        if (left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }
    }

    targetHit() {
        this.coinMusic.play();
        this.emitter.start();
        this.target.setY(0);
        this.target.setX(this.getRandomX());
        this.points++;
        this.textScore.setText(`Score: ${this.points}`);
    }

    gameOver() {
        this.scene.stop();
        canvas.style.display = 'none';
        gameEndScoreSpan.textContent = this.points;
        gameWinLoseSpan.textContent = this.points >= 10 ? "Win!" : "Lose!";
        gameEndDiv.style.display = "flex";
    }
}

// Game configuration
const config = {
    type: Phaser.WEBGL,
    width: size.width,
    height: size.height,
    canvas: canvas,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: speedDown },
            debug: true
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
    gameStartDiv.style.display = "none";
    canvas.style.display = "block";
    game.scene.start('scene-game');
});

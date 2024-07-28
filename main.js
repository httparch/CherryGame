import './style.css'
import Phaser, { WEBGL } from 'phaser'

const size = {
    width:500,
    height:700
}

const speedDown = 750;

const gameStartDiv = document.querySelector('#gameStartDiv');
const gameStartBtn = document.querySelector('#gameStartBtn');
const gameEndDiv = document.querySelector('#gameEndDiv');
const gameWinLoseSpan = document.querySelector('#gameWinLoseSpan');
const gameEndScoreSpan = document.querySelector('#gameEndScoreSpan');

class GameScene extends Phaser.Scene{
    constructor(){
        super("scene-game")
        this.player
        this.cursor
        this.playerSpeed = speedDown + 50;
        this.target
        this.points = 0
        this.textScore
        this.textTime
        this.timedEvent
        this.remainingTime
        this.coinMusic
        this.bgMusic
        this.emitter
    }

    preload(){
        this.load.image("bg", "/assets/bg.png")
        this.load.image("colet","/assets/colet.png")
        this.load.image("cherry","/assets/cherry.png")
        this.load.image("confetti","/assets/confetti.png")
        this.load.audio("coin","/assets/coin.mp3")
        this.load.audio("bgMusic","/assets/bgMusic.mp3")
        this.load.image("trash","/assets/trash.png")
    }

    create() {
            this.scene.pause("scene-game");
        
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
            this.player.setSize(this.player.width - this.player.width / 4, this.player.height / 6)
                .setOffset(this.player.width / 10, this.player.height - this.player.height / 10);
        
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
        
            // Timer event for spawning cherry
            this.spawnTrashTimer = this.time.addEvent({
                delay: 1000, // Interval in milliseconds
                callback: this.spawnTrash,
                callbackScope: this,
                loop: true
            });
        }

        //spawn trashes
        spawnTrash() {
            let trash = this.physics.add.image(this.getRandomX(), 0, 'trash').setOrigin(0, 0);
            trash.setVelocityY(200); // Set the speed of the falling cherry
            this.physics.add.overlap(this.player, trash, this.collectTrash, null, this);
        }
        
        collectTrash(player, trash) {
            this.gameOver();
        }
        
        getRandomX() {
            return Math.floor(Math.random() * size.width);
        }

    update(){
        this.remainingTime = this.timedEvent.getRemainingSeconds()
        this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`)

        if(this.target.y >= size.height){
            this.gameOver();
            /*
            this.target.setY(0);
            this.target.setX(this.getRandomX())*/
        }

        const {left,right} = this.cursor;

        if(left.isDown){
            this.player.setVelocityX(-this.playerSpeed);
        }else if(right.isDown){
            this.player.setVelocityX(this.playerSpeed);
        }else{
            this.player.setVelocityX(0);
        }

    }

    getRandomX(){
        return Math.floor(Math.random() * 400);
    }

    targetHit(){
        this.coinMusic.play()
        this.emitter.start()
        this.target.setY(0);
        this.target.setX(this.getRandomX());
        this.points++;
        this.textScore.setText(`Score: ${this.points}`)
    }

    gameOver(){
        this.sys.game.destroy(true);
        if(this.points >= 10){
            gameEndScoreSpan.textContent = this.points
            gameWinLoseSpan.textContent = "Win!"
        }else{
            gameEndScoreSpan.textContent = this.points
            gameWinLoseSpan.textContent = "Lose!"
        }

        gameEndDiv.style.display = "flex"

    }

}
//config setting for starting up the game
const config = {
    type:Phaser,WEBGL,
    width: size.width,
    height:size.height,
    canvas:gameCanvas,
    physics:{
        default:"arcade",
        arcade:{
            gravity:{y:speedDown},
            debug:true
        }
    },
    scene:[GameScene]
}

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", ()=>{
    gameStartDiv.style.display = "none"
    game.scene.resume('scene-game')
})

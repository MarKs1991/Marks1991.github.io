"use strict";
var PongMaster;
(function (PongMaster) {
    var f = FudgeCore;
    let keysPressed = {};
    window.addEventListener("load", hndLoad);
    let viewport;
    let ball = new f.Node("Ball");
    let paddleLeft = new f.Node("PaddleLeft");
    let paddleRight = new f.Node("PaddleRight");
    let playArea = new f.Node("Playarea");
    let scoreLeftPlayer = 0;
    let scoreRightPlayer = 0;
    let timerStart = 0;
    let timerEnd = 10;
    let bounceblocked = false;
    let leftPlayerColor = new f.Color(1, 0, 0, 0);
    let rightPlayerColor = new f.Color(0, 1, 0, 0);
    let ballColor = new f.Color(1, 0, 1, 0);
    let positionZero = new f.Vector3(0, 0, 0);
    let directionx = 1;
    let directiony = 1;
    let ballSpeed = new f.Vector3(0.2 * directionx, 0.2 * directiony, 0);
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        f.Debug.log(canvas);
        let pong = createPong();
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(42);
        paddleRight.cmpTransform.local.translateX(20);
        paddleLeft.cmpTransform.local.translateX(-20);
        paddleLeft.getComponent(f.ComponentMesh).pivot.scaleY(6);
        paddleRight.getComponent(f.ComponentMesh).pivot.scaleY(6);
        // playArea.cmpTransform.local.translateX();
        playArea.cmpTransform.local.translation = new f.Vector3(0, 0, 0);
        playArea.cmpTransform.local.scaling.x = 21;
        playArea.cmpTransform.local.scaling.y = 14;
        viewport = new f.Viewport();
        viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(viewport);
        document.addEventListener("keydown", hndKeydown);
        document.addEventListener("keyup", hndKeyup);
        viewport.draw();
        f.Debug.log(playArea);
        // setInterval(handler, milliseconds);
        // requestAnimationFrame(handler);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update(_event) {
        //TesterInput();
        KeyboardInput();
        moveBall();
        if (detectHit(ball.cmpTransform.local.translation, paddleLeft)) {
            bounceFromPaddle();
            leftPlayerColor.r = Math.random();
            leftPlayerColor.g = Math.random();
            leftPlayerColor.b = Math.random();
            ballColor.r = Math.random();
            ballColor.g = Math.random();
            ballColor.b = Math.random();
        }
        if (detectHit(ball.cmpTransform.local.translation, paddleRight)) {
            bounceFromPaddle();
            rightPlayerColor.r = Math.random();
            rightPlayerColor.g = Math.random();
            rightPlayerColor.b = Math.random();
            ballColor.r = Math.random();
            ballColor.g = Math.random();
            ballColor.b = Math.random();
        }
        if (inPlayerArea(ball.cmpTransform.local.translation, playArea.cmpTransform.local) == false && ball.cmpTransform.local.translation.y > 14 || ball.cmpTransform.local.translation.y < -14) { // ballSpeed.x = ballSpeed.x * Math.random();
            bounceFromBorder();
        }
        // count Time from last Collision
        timerEnd = performance.now();
        // when goal is touched by ball score +1 and reset Ball to 0,0,0
        if (inPlayerArea(ball.cmpTransform.local.translation, playArea.cmpTransform.local) == false && ball.cmpTransform.local.translation.x > 21 || ball.cmpTransform.local.translation.x < -21) {
            ballSpeed.x = ballSpeed.x * -1;
            //if RightGoal is hit
            if (ball.cmpTransform.local.translation.x > 21) {
                ball.cmpTransform.local.translation = positionZero;
                scoreLeftPlayer++;
                ballSpeed = new f.Vector3(0.2, 0.2, 0);
                directionx = directionx * -1;
            }
            //if LeftGoal is hit
            if (ball.cmpTransform.local.translation.x < -21) {
                ball.cmpTransform.local.translation = positionZero;
                scoreRightPlayer++;
                ballSpeed = new f.Vector3(0.2, 0.2, 0);
            }
        }
        // if counted Time and therefore last Collsion is 0.2 secs in the Past then release bounceBlock
        if (timerEnd - timerStart >= 50) {
            bounceblocked = false;
            // console.log("open" );
        }
        if (timerEnd - timerStart < 50) {
            bounceblocked = true;
        }
        let scoreCounterLeftPlayer = document.getElementById("scoreLeftPlayer");
        let scoreCounterRightPlayer = document.getElementById("scoreRightPlayer");
        scoreCounterLeftPlayer.innerHTML = scoreLeftPlayer.toString();
        scoreCounterRightPlayer.innerHTML = scoreRightPlayer.toString();
        f.RenderManager.update();
        viewport.draw();
    }
    function isBlocked() {
        if (bounceblocked) {
            timerEnd = performance.now();
            console.log("Call to doSomething took " + (timerEnd - timerStart) + " milliseconds.");
        }
        timerStart = performance.now();
        bounceblocked = true;
    }
    function detectHit(_ballPos, _paddle) {
        let topLeft = (new f.Vector3(_paddle.cmpTransform.local.translation.x - _paddle.getComponent(f.ComponentMesh).pivot.scaling.x, _paddle.cmpTransform.local.translation.y + (_paddle.getComponent(f.ComponentMesh).pivot.scaling.y / 2), 0));
        let bottomRight = (new f.Vector3(_paddle.cmpTransform.local.translation.x + _paddle.getComponent(f.ComponentMesh).pivot.scaling.x, _paddle.cmpTransform.local.translation.y - (_paddle.getComponent(f.ComponentMesh).pivot.scaling.y / 2), 0));
        if (_ballPos.x > topLeft.x && _ballPos.y < topLeft.y) {
            if (_ballPos.x < bottomRight.x && _ballPos.y > bottomRight.y) {
                f.Debug.log(topLeft);
                f.Debug.log(bottomRight);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    function inPlayerArea(_ballPos, paddlePos) {
        let topLeft = (new f.Vector3(paddlePos.translation.x - paddlePos.scaling.x, paddlePos.translation.y + paddlePos.scaling.y, 0));
        let bottomRight = (new f.Vector3(paddlePos.translation.x + paddlePos.scaling.x, paddlePos.translation.y - paddlePos.scaling.y, 0));
        if (_ballPos.x > topLeft.x && _ballPos.y < topLeft.y) {
            if (_ballPos.x < bottomRight.x && _ballPos.y > bottomRight.y) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    function KeyboardInput() {
        if (keysPressed[f.KEYBOARD_CODE.ARROW_UP] && paddleRight.cmpTransform.local.translation.y < 11)
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, 0.3, 0));
        if (keysPressed[f.KEYBOARD_CODE.ARROW_DOWN] && paddleRight.cmpTransform.local.translation.y > -11)
            paddleRight.cmpTransform.local.translate(f.Vector3.Y(-0.3));
        if (keysPressed[f.KEYBOARD_CODE.W] && paddleLeft.cmpTransform.local.translation.y < 11)
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, 0.3, 0));
        if (keysPressed[f.KEYBOARD_CODE.S] && paddleLeft.cmpTransform.local.translation.y > -11)
            paddleLeft.cmpTransform.local.translate(f.Vector3.Y(-0.3));
    }
    /*
    function TesterInput(): void {
        if (keysPressed[f.KEYBOARD_CODE.W])
            ball.cmpTransform.local.translate(new f.Vector3(0, 0.3, 0));
        


        if (keysPressed[f.KEYBOARD_CODE.S])
            ball.cmpTransform.local.translate(f.Vector3.Y(-0.3));
        


        if (keysPressed[f.KEYBOARD_CODE.A])
            ball.cmpTransform.local.translate(new f.Vector3(-0.3, 0, 0));
        


        if (keysPressed[f.KEYBOARD_CODE.D])
            ball.cmpTransform.local.translate(f.Vector3.X(0.3));
        


        // f.Debug.log(ball.cmpTransform.local.translation.x);
    }

*/
    function bounceFromPaddle() {
        if (ball.cmpTransform.local.translation.y >= 0 && ball.cmpTransform.local.translation.y < 4 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * .9) * -1;
            f.Debug.log("PMitteR");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y <= 0 && ball.cmpTransform.local.translation.y > -4 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * .9) * -1;
            f.Debug.log("PMitteL");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y >= 4 && ball.cmpTransform.local.translation.y < 8 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1) * -1;
            f.Debug.log("Pa1r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y <= -4 && ball.cmpTransform.local.translation.y > -8 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1) * -1;
            f.Debug.log("Pa1l");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y >= 8 && ball.cmpTransform.local.translation.y < 12 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1.1) * -1;
            f.Debug.log("Pa2r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y <= -8 && ball.cmpTransform.local.translation.y > -12 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1.1) * -1;
            f.Debug.log("Pa2l");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y >= 12 && ball.cmpTransform.local.translation.y < 20 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1.2) * -1;
            f.Debug.log("Pa3r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.y <= -12 && ball.cmpTransform.local.translation.y > -20 && !bounceblocked) {
            ballSpeed.x = (ballSpeed.x * 1.2) * -1;
            f.Debug.log("Pa3l");
            isBlocked();
        }
    }
    function bounceFromBorder() {
        if (ball.cmpTransform.local.translation.x >= 0 && ball.cmpTransform.local.translation.x < 7 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * .9) * -1;
            f.Debug.log("MitteR");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x <= 0 && ball.cmpTransform.local.translation.x > -7 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * .9) * -1;
            f.Debug.log("MitteL");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x >= 7 && ball.cmpTransform.local.translation.x < 14 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1) * -1;
            f.Debug.log("a1r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x <= -7 && ball.cmpTransform.local.translation.x > -14 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1) * -1;
            f.Debug.log("a1l");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x >= 14 && ball.cmpTransform.local.translation.x < 21 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1.1) * -1;
            f.Debug.log("a2r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x <= -14 && ball.cmpTransform.local.translation.x > -21 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1.1) * -1;
            f.Debug.log("a2l");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x >= 21 && ball.cmpTransform.local.translation.x < 40 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1.2) * -1;
            f.Debug.log("a3r");
            isBlocked();
        }
        if (ball.cmpTransform.local.translation.x <= -21 && ball.cmpTransform.local.translation.x > -40 && !bounceblocked) {
            ballSpeed.y = (ballSpeed.y * 1.2) * -1;
            f.Debug.log("a3l");
            isBlocked();
        }
    }
    function moveBall() {
        ball.cmpTransform.local.translate(new f.Vector3(ballSpeed.x * directionx, ballSpeed.y * directionx, ballSpeed.z));
    }
    function hndKeyup(_event) {
        keysPressed[_event.code] = false;
    }
    function hndKeydown(_event) {
        keysPressed[_event.code] = true;
    }
    function createPong() {
        let pong = new f.Node("Pong");
        let mtrRightPlayer = new f.Material("SolidRed", f.ShaderUniColor, new f.CoatColored(rightPlayerColor));
        let mtrLeftPlayer = new f.Material("SolidGreen", f.ShaderUniColor, new f.CoatColored(leftPlayerColor));
        let mtrBall = new f.Material("ballColor", f.ShaderUniColor, new f.CoatColored(ballColor));
        let meshQuad = new f.MeshQuad();
        ball.addComponent(new f.ComponentMesh(meshQuad));
        paddleLeft.addComponent(new f.ComponentMesh(meshQuad));
        paddleRight.addComponent(new f.ComponentMesh(meshQuad));
        // playArea.addComponent(new f.ComponentMesh(meshQuad));
        ball.addComponent(new f.ComponentMaterial(mtrBall));
        paddleLeft.addComponent(new f.ComponentMaterial(mtrLeftPlayer));
        paddleRight.addComponent(new f.ComponentMaterial(mtrRightPlayer));
        // playArea.addComponent(new f.ComponentMaterial(mtrSolidWhite));
        ball.addComponent(new f.ComponentTransform());
        paddleLeft.addComponent(new f.ComponentTransform());
        paddleRight.addComponent(new f.ComponentTransform());
        playArea.addComponent(new f.ComponentTransform());
        pong.appendChild(ball);
        pong.appendChild(paddleLeft);
        pong.appendChild(paddleRight);
        pong.appendChild(playArea);
        return pong;
    }
})(PongMaster || (PongMaster = {}));
//# sourceMappingURL=Main.js.map
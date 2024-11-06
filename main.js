const socket = io();

let playerID, thisPlayerColor;
let thisPlayer, thisPlayerContrR, thisPlayerContrL;

let camera, scene, renderer;
let controller1, controller2;

AFRAME.registerComponent('controller-handler', {
    init: function () {
        this.controller1 = this.el.sceneEl.renderer.xr.getController(0);
        this.controller2 = this.el.sceneEl.renderer.xr.getController(1);

        console.log('Controller 1:', this.controller1);
        console.log('Controller 2:', this.controller2);
    },
});

AFRAME.registerComponent('net-sync', {
    init: function () {
        this.player = this.el;

        this.controller1 = this.el.sceneEl.renderer.xr.getController(0);
        this.controller2 = this.el.sceneEl.renderer.xr.getController(1);

        console.log('Controller 1:', this.controller1);
        console.log('Controller 2:', this.controller2);
    },
    tick: function () {

        let updateMessage;

        if (this.player) {
            updateMessage += {
                position: this.player.getAttribute('position'),
                rotation: this.player.getAttribute('rotation')
            };
        }
        if (this.controller1) {
            updateMessage += {
                contr_pos_r: this.controller1.position,
                contr_rot_r: this.controller1.rotation
            };
            //console.log('Controller 1 Position:', this.controller1.position);
            //console.log('Controller 1 Rotation:', this.controller1.rotation);
        }
        if (this.controller2) {
            updateMessage += {
                contr_pos_l: this.controller2.position,
                contr_rot_l: this.controller2.rotation
            };
            //console.log('Controller 2 Position:', this.controller2.position);
            //console.log('Controller 2 Rotation:', this.controller2.rotation);
        }

        console.log('Update Message:', updateMessage);
        socket.emit('update', updateMessage);
    }
});

// scene = this.el.sceneEl.object3D;

// renderer = this.el.sceneEl.renderer;

// console.log('scene');
// console.log(scene);
// console.log('renderer');
// console.log(renderer);

socket.on('yourPlayerInfo', (socket) => {

    // get the Connection ID of the Player
    playerID = socket.id;
    thisPlayerColor = socket.color;

    // Spawn yourself Entity
    addPlayer(socket);
    // get the Player Entity
    thisPlayer = document.getElementById(playerID);
    thisPlayerContrR = document.getElementById(playerID + '_contr_r');
    thisPlayerContrL = document.getElementById(playerID + '_contr_l');
    // give yourself movement and rotation controls
    thisPlayer.setAttribute('camera', '');
    thisPlayer.setAttribute('look-controls', '');
    thisPlayer.setAttribute('wasd-controls', '');
    thisPlayer.setAttribute('controller-handler', '');

    thisPlayerContrR.setAttribute('tracked-controls', 'controller: 0');
    thisPlayerContrL.setAttribute('tracked-controls', 'controller: 1');


    // controller1 = renderer.xr.getController(0);
    // controller2 = renderer.xr.getController(1);
    // console.log(controller1);
    // console.log(controller2);
});


document.addEventListener('click', () => {
    socket.emit('clicked');
});

socket.on('colorChanged', (color) => {
    document.getElementById('testBox').setAttribute('color', color);
});

// get Player Information from the Server and calling Spawning function
socket.on('currentState', (players) => {
    Object.keys(players).forEach((id) => {
        let playerByID = document.getElementById(id) || addPlayer(players[id]);
        if (playerByID) {
            playerByID.setAttribute('position', players[id].position);
            playerByID.setAttribute('rotation', players[id].rotation);

            //playerByID.object3D.position.set(players[id].position.x, players[id].position.y, players[id].position.z);
            //playerByID.object3D.rotation.set(players[id].rotation.x, players[id].rotation.y, players[id].rotation.z);
        }
    });
});

// Spawn Player Entity with the Connection ID
function addPlayer(player) {
    const playerElem = document.createElement('a-box');
    playerElem.setAttribute('id', player.id);
    playerElem.setAttribute('position', player.position);
    playerElem.setAttribute('rotation', player.rotation);
    playerElem.setAttribute('color', player.color);
    document.querySelector('a-scene').appendChild(playerElem);

    const playerContrR = document.createElement('a-box');
    playerContrR.setAttribute('id', player.id + '_contr_r');
    playerContrR.setAttribute('position', player.contr_pos_r);
    playerContrR.setAttribute('rotation', player.contr_rot_r);
    playerContrR.setAttribute('color', player.color);
    playerContrR.setAttribute('scale', '0.3 0.3 0.3');
    document.querySelector('a-scene').appendChild(playerContrR);

    const playerContrL = document.createElement('a-box');
    playerContrL.setAttribute('id', player.id + '_contr_l');
    playerContrL.setAttribute('position', player.contr_pos_l);
    playerContrL.setAttribute('rotation', player.contr_rot_l);
    playerContrL.setAttribute('color', player.color);
    playerContrL.setAttribute('scale', '0.3 0.3 0.3');
    document.querySelector('a-scene').appendChild(playerContrL);
}

socket.on('newPlayer', (player) => {
    console.log('New player joined: ', player.id);
    addPlayer(player);
});

socket.on('playerDisconnected', (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.parentNode.removeChild(el);
    }
});

// Detect player movement and rotation
/*
if (thisPlayer) {
    thisPlayer.addEventListener('componentchanged', (event) => {
        console.log('player moved');
        if (event.detail.name === 'position' || event.detail.name === 'rotation') {
            console.log('Player moved');
            socket.emit('playerMoved', {
                id: socket.id,
                position: player.getAttribute('position'),
                rotation: player.getAttribute('rotation')
            });
        }
    });
} */

setInterval(function () {
    if (thisPlayer) {
        socket.emit('update', {
            position: thisPlayer.getAttribute('position'),
            rotation: thisPlayer.getAttribute('rotation'),
            contr_pos_r: thisPlayerContrR.getAttribute('position'),
            contr_pos_l: thisPlayerContrL.getAttribute('position'),
            contr_rot_r: thisPlayerContrR.getAttribute('rotation'),
            contr_rot_l: thisPlayerContrL.getAttribute('rotation')
        });
    }
}, 20);
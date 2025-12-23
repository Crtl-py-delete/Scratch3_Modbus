const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

class Scratch3Modbus {

    constructor () {
        this.ws = new WebSocket('ws://localhost:8080');
        this.lastValue = 0;
        this.lastCoilValue = 0;
        this.lastInputStatusValue = 0;

        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === 'holdingValue') {
                this.lastValue = msg.value;
            }

            if (msg.type === 'coilValue') {
                this.lastCoilValue = msg.value;
            }

            if (msg.type === 'inputStatusValue') {
                this.lastInputStatusValue = msg.value;
            }

            if (msg.type === 'error') {
                console.error('Modbus error:', msg.message);
            }
        };
    }

    getInfo () {
        return {
            id: 'modbus',
            name: 'Modbus TCP',
            color1: '#4b9cd3',
            color2: '#3478a3',

            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: 'connect Modbus TCP ip [IP] unit [UNIT]',
                    arguments: {
                        IP: {
                            type: ArgumentType.STRING,
                            defaultValue: '127.0.0.1'
                        },
                        UNIT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'readHolding',
                    blockType: BlockType.REPORTER,
                    text: 'read holding register [ADDR]',
                    arguments: {
                        ADDR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'readCoils',
                    blockType: BlockType.REPORTER,
                    text: 'read coil [ADDR]',
                    arguments: {
                        ADDR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'readInputStatus',
                    blockType: BlockType.REPORTER,
                    text: 'read input status [ADDR]',
                    arguments: {
                        ADDR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                }
            ]
        };
    }

  
    /**
     * implementation of the block with the opcode that matches this name
     *  this will be called when the block is used
     */
        connect ({ IP, UNIT }) {
        this.ws.send(JSON.stringify({
            type: 'connect',
            ip: IP,
            unitId: UNIT
        }));
    }

    readHolding ({ ADDR }) {
        this.ws.send(JSON.stringify({
            type: 'readHolding',
            address: ADDR
        }));

        // Scratch reporters must return immediately
        return this.lastValue;
    }

    readCoils ({ ADDR }) {
        this.ws.send(JSON.stringify({
            type: 'readCoils',
            address: ADDR
        }));

        // Scratch reporters must return immediately
        return this.lastCoilValue;
    }

    readInputStatus ({ ADDR }) {
        this.ws.send(JSON.stringify({
            type: 'readInputStatus',
            address: ADDR
        }));

        // Scratch reporters must return immediately
        return this.lastInputStatusValue;
    }

    }

module.exports = Scratch3Modbus;

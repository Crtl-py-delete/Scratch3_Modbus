const WebSocket = require('ws');
const ModbusRTU = require('modbus-serial');
//poort niet wijzigen!!
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
const modbus = new ModbusRTU();

let connected = false;
// modbus adress, mag je wel wijzigen.
let modbus_port = 502;

wss.on('connection', ws => {
    console.log('Scratch connected');

    ws.on('message', async message => {
        try {
            const cmd = JSON.parse(message);

            // CONNECT
            if (cmd.type === 'connect') {
                await modbus.connectTCP(cmd.ip, { port: modbus_port });
                modbus.setID(cmd.unitId);
                connected = true;

                ws.send(JSON.stringify({ type: 'connected' }));
            }

            // READ HOLDING REGISTER
            if (cmd.type === 'readHolding') {
                if (!connected) throw new Error('Not connected');

                const res = await modbus.readHoldingRegisters(cmd.address, 1);
                ws.send(JSON.stringify({
                    type: 'holdingValue',
                    value: res.data[0]
                }));
            }

            // READ COILS
            if (cmd.type === 'readCoils') {
                if (!connected) throw new Error('Not connected');

                const res = await modbus.readCoils(cmd.address, 1);
                ws.send(JSON.stringify({
                    type: 'coilValue',
                    value: res.data[0]
                }));
            }

            // READ INPUT STATUS (Discrete Inputs)
            if (cmd.type === 'readInputStatus') {
                if (!connected) throw new Error('Not connected');

                const res = await modbus.readDiscreteInputs(cmd.address, 1);
                ws.send(JSON.stringify({
                    type: 'inputStatusValue',
                    value: res.data[0]
                }));
            }

        } catch (err) {
            ws.send(JSON.stringify({
                type: 'error',
                message: err.message
            }));
        }
    });
});

console.log('Modbus WebSocket server running on ws://localhost:8080');
console.log('Modbus TCP port: ' + modbus_port);
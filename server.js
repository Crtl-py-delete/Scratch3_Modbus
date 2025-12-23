const WebSocket = require('ws');
const ModbusRTU = require('modbus-serial');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
const modbus = new ModbusRTU();

let connected = false;

wss.on('connection', ws => {
    console.log('Scratch connected');

    ws.on('message', async message => {
        try {
            const cmd = JSON.parse(message);

            // CONNECT
            if (cmd.type === 'connect') {
                await modbus.connectTCP(cmd.ip, { port: 502 });
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

        } catch (err) {
            ws.send(JSON.stringify({
                type: 'error',
                message: err.message
            }));
        }
    });
});

console.log('Modbus helper running on ws://localhost:8080');
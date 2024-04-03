const readline = require('readline');
const axios = require('axios');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let SERVER_URL = '';

async function sendRequest(method, url, data) {
    try {
        const response = await axios({
            method: method,
            url: `${SERVER_URL}${url}`,
            data: data
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

// GET - чтение файла
async function handleGetRequest(filePath) {
    try {
        const filename = path.parse(filePath).base;
        const data = await sendRequest('GET', `/files/${filename}`, { filePath: filePath.trim() });
        console.log('File content:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// PUT - перезапись файла
async function handlePutRequest(filePath, newData) {
    try {
        const filename = path.parse(filePath).base;
        const response = await sendRequest('PUT', `/files/${filename}`, { filePath: filePath.trim(), data: newData });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// POST - добавление в конец файла
async function handlePostRequest(filePath, newData) {
    try {
        const filename = path.parse(filePath).base;
        const response = await sendRequest('POST', `/files/${filename}`, { filePath: filePath.trim(), data: newData });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// DELETE - удаление файла
async function handleDeleteRequest(filePath) {
    try {
        const filename = path.parse(filePath).base;
        const response = await sendRequest('DELETE', `/files/${filename}`, { filePath: filePath.trim() });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// COPY - копирование файла
async function handleCopyRequest(filePath, destination) {
    try {
        const filename = path.parse(filePath).base;
        const response = await sendRequest('POST', `/files/${filename}/copy`, { filePath: filePath.trim(), destination: destination.trim() });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// MOVE - перемещение файла
async function handleMoveRequest(filePath, destination) {
    try {
        const filename = path.parse(filePath).base;
        const response = await sendRequest('POST', `/files/${filename}/move`, { filePath: filePath.trim(), destination: destination.trim() });
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function startClient() {
    const host = await askUserInput('Enter the host: ');
    const port = await askUserInput('Enter the port number: ');
    SERVER_URL = `http://${host}:${port}`;

    while (true) {
        let command = await askUserInput('Enter command (GET, PUT, POST, DELETE, COPY, MOVE, EXIT): ');
        command = command.toUpperCase().trim();
        if (command === 'EXIT') {
            rl.close();
            return;
        }
        switch (command) {
            case 'GET':
                const filenameGet = await askUserInput('Enter filepath: ');
                await handleGetRequest(filenameGet);
                break;
            case 'PUT':
                const filenamePut = await askUserInput('Enter filepath: ');
                const newDataPut = await askUserInput('Enter new data: ');
                await handlePutRequest(filenamePut, newDataPut);
                break;
            case 'POST':
                const filenamePost = await askUserInput('Enter filepath: ');
                const newDataPost = await askUserInput('Enter data to append: ');
                await handlePostRequest(filenamePost, newDataPost);
                break;
            case 'DELETE':
                const filepathDelete = await askUserInput('Enter filepath: ');
                await handleDeleteRequest(filepathDelete);
                break;
            case 'COPY':
                const filenameCopy = await askUserInput('Enter source filepath: ');
                const destinationCopy = await askUserInput('Enter destination filepath: ');
                await handleCopyRequest(filenameCopy, destinationCopy);
                break;
            case 'MOVE':
                const filenameMove = await askUserInput('Enter source filepath: ');
                const destinationMove = await askUserInput('Enter destination filepath: ');
                await handleMoveRequest(filenameMove, destinationMove);
                break;
            default:
                console.log('Invalid command.');
        }
    }
}

function askUserInput(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

startClient()
    .then(() => {
        console.log('Terminated')
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

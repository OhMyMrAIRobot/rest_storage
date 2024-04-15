const express = require('express')
const fs = require('fs').promises;
const path = require('path');
const readline = require("readline");

const app = express();
const FILE_STORAGE_DIR = path.join(__dirname, 'storage');

app.use(express.json());

const startServer = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the host: ', (host) => {
        rl.question('Enter the port number: ', (port) => {
            app.listen(port, host, () => {
                console.log(`Server is running at ${host}:${port}`);
            });
            rl.close();
        });
    });
}

// GET - чтение файла
app.get('/files/:filename', async (req, res) => {
    const filePath = req.body.filePath;
    const fullPath = path.join(FILE_STORAGE_DIR, filePath);

    try {
        const data = await fs.readFile(fullPath, 'utf-8');
        res.status(200).send(data);
    } catch (err) {
        res.status(404).send('File not found');
    }
});

// PUT - перезапись файла
app.put('/files/:filename', async (req, res) => {
    const fileDir = path.join(FILE_STORAGE_DIR, path.parse(req.body.filePath).dir);
    const fullPath = path.join(FILE_STORAGE_DIR, req.body.filePath);
    const newData = req.body.data;
    try {
        const dirExists = await fs.access(fileDir).then(() => true).catch(() => false);
        if (!dirExists) {
            await fs.mkdir(fileDir, { recursive: true });
        }
        await fs.writeFile(fullPath, newData);
        res.status(200).send('File updated');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            res.status(500).send('Error updating file');
        }
    }
});

// POST - добавление в конец файла
app.post('/files/:filename', async (req, res) => {
    const filePath = req.body.filePath;
    const fullPath = path.join(FILE_STORAGE_DIR, filePath);
    const newData = req.body.data;

    try {
        await fs.access(fullPath, fs.constants.F_OK);
        await fs.appendFile(fullPath, newData);
        res.status(200).send('Data appended to file');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            res.status(500).send('Error appending data to file');
        }
    }
});

// DELETE - удаление файла
app.delete('/files/:filename', async (req, res) => {
    const filePath = req.body.filePath;
    const fullPath = path.join(FILE_STORAGE_DIR, filePath);

    try {
        await fs.access(fullPath, fs.constants.F_OK);
        await fs.unlink(fullPath);
        res.status(200).send('File deleted');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            res.status(500).send('Error deleting file');
        }
    }
});

// COPY - копирование файла
app.post('/files/:filename/copy', async (req, res) => {
    const srcFilePath = path.join(FILE_STORAGE_DIR, req.body.filePath);
    let destDir = path.join(FILE_STORAGE_DIR, req.body.destination);
    let destFilePath = path.join(destDir, req.params.filename);

    try {
        await fs.access(srcFilePath, fs.constants.F_OK);
        const dirExists = await fs.access(destDir).then(() => true).catch(() => false);
        if (!dirExists) {
            await fs.mkdir(destDir, { recursive: true });
        }

        const fileExists = await fs.access(destFilePath).then(() => true).catch(() => false);
        if (fileExists){
            const fileExt = path.extname(destFilePath);
            const fileName = path.basename(destFilePath, fileExt);
            const newFileName = `${fileName}_${(+ new Date).toString(16)}${fileExt}`;
            destFilePath = path.join(destDir, newFileName);
        }

        await fs.copyFile(srcFilePath, destFilePath);
        res.status(200).send('File copied');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('Source file not found');
        } else {
            res.status(500).send('Error copying file');
        }
    }
});

// MOVE - перемещение файла
app.post('/files/:filename/move', async (req, res) => {
    const srcFilePath = path.join(FILE_STORAGE_DIR, req.body.filePath);
    const destDir = path.join(FILE_STORAGE_DIR, req.body.destination);
    let destFilePath = path.join(destDir, req.params.filename);

    try {
        await fs.access(srcFilePath, fs.constants.F_OK);
        const dirExists = await fs.access(destDir).then(() => true).catch(() => false);
        if (!dirExists) {
            await fs.mkdir(destDir, { recursive: true });
        }

        const fileExists = await fs.access(destFilePath).then(() => true).catch(() => false);
        if (fileExists){
            const fileExt = path.extname(destFilePath);
            const fileName = path.basename(destFilePath, fileExt);
            const newFileName = `${fileName}_${(+ new Date).toString(16)}${fileExt}`;
            destFilePath = path.join(destDir, newFileName);
        }

        await fs.rename(srcFilePath, destFilePath);
        res.status(200).send('File moved');
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('Source file not found');
        } else {
            res.status(500).send('Error moving file');
        }
    }
});

startServer();





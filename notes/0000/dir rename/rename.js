const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, './'); // 目标文件夹路径

const BASE_START = 81; // 基础起始数字

// 读取当前目录下的所有文件和文件夹
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('无法读取目录:', err);
        return;
    }

    files.forEach(file => {
        const oldPath = path.join(directoryPath, file);
        
        // 检查是否是目录
        if (fs.statSync(oldPath).isDirectory()) {
            const match = file.match(/^(\d+)\.(.*)$/);
            if (match) {
                const oldNumber = parseInt(match[1], 10);
                const newNumber = String(oldNumber + BASE_START).padStart(4, '0');
                const newName = `${newNumber}.${match[2]}`.trim();
                const newPath = path.join(directoryPath, newName);

                // 重命名文件夹
                fs.rename(oldPath, newPath, err => {
                    if (err) {
                        console.error(`重命名失败: ${file} -> ${newName}`, err);
                    } else {
                        console.log(`重命名成功: ${file} -> ${newName}`);
                    }
                });
            }
        }
    });
});

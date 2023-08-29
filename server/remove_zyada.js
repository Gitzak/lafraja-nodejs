const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../db/movies.json');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    try {
        const jsonData = JSON.parse(data);
        const uniqueData = removeDuplicates(jsonData, 'id');
        const jsonString = JSON.stringify(uniqueData, null, 2);

        fs.writeFile(filePath, jsonString, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return;
            }
            console.log('Duplicates removed and data written successfully.');
        });
    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});

function removeDuplicates(dataArray, key) {
    const seen = new Set();
    return dataArray.filter((item) => {
        const keyValue = item[key];
        if (!seen.has(keyValue)) {
            seen.add(keyValue);
            return true;
        }
        return false;
    });
}

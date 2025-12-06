import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const zip = new AdmZip();
const outputDir = "./";
const outputFile = "project_code.zip";

console.log("Zipping project files...");

// Add all files in current directory, excluding node_modules and .git
const files = fs.readdirSync('.');

files.forEach(file => {
    if (file !== 'node_modules' && file !== '.git' && file !== outputFile && file !== '.DS_Store') {
        const filePath = path.join('.', file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            zip.addLocalFolder(filePath, file);
        } else {
            zip.addLocalFile(filePath);
        }
    }
});

zip.writeZip(outputFile);
console.log(`Created ${outputFile} successfully.`);

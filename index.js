import { exit } from 'process';
import * as readline from 'node:readline/promises';
import Downloader from './code/Downloader.js';

const args = process.argv.slice(2);

let class_id = args[0];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

if (!class_id) {
    class_id = await rl.question('Please specify a course to download ? ')
}

const downloader = new Downloader();

//Checking if class_id is an url 
if (class_id.includes('www')) {
    await downloader.download_course_by_url(class_id);
} else {
    await downloader.download_course_by_class_id(class_id);
}

exit(0);


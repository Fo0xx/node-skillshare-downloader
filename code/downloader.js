import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import ProgressBar from 'progress';
import { promisify } from 'util';
import * as stream from 'stream';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

function slugify(text) {
    return text
        .toString()                   // Cast to string (optional)
        .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase()                // Convert the string to lowercase letters
        .trim()                       // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
        .replace(/\_/g, '-')           // Replace _ with -
        .replace(/\-\-+/g, '-')       // Replace multiple - with single -
        .replace(/\-$/g, '');         // Remove trailing -
}

export default class Downloader {

    constructor() {
        this.pk = process.env.PK;
        this.download_path = process.env.FILE_PATH || './courses';
        this.brightcove_account_id = process.env.BRIGHTCOVE_ACCOUNT_ID;
    }

    /**
     * Download a course using the URL of the course
     * 
     * @param url - The URL of the video you want to download.
     */
    async download_course_by_url(url) {
        let class_id = url.match(/\d{4,}/)[0];

        if (!class_id) throw new Error('Failed to parse class ID from URL');

        this.download_course_by_class_id(class_id)
    }

    /**
     * It downloads a course by class_id
     * 
     * @param class_id - The class ID of the course you want to download.
     */
    async download_course_by_class_id(class_id) {

        let data = await this.fetch_course_data_by_class_id(class_id);
        let teacher = null;

        if ('vanity_username' in data['_embedded']['teacher']) {
            teacher = data['_embedded']['teacher']['vanity_username'];
        }

        if (!teacher) teacher = data['_embedded']['teacher']['full_name'];

        if (!teacher) throw new Error('Failed to read teacher name from data');

        let title = data['title'];

        let base_path = path.join(
            this.download_path,
            slugify(teacher),
            slugify(title),
        ).replace(/\/$/, '');

        if (!fs.existsSync(base_path)) fs.mkdirSync(base_path, { recursive: true });

        try {
            for (let u of data['_embedded']['units']['_embedded']['units']) {
                for (let s of u['_embedded']['sessions']['_embedded']['sessions']) {
                    let video_id = null;

                    if ('video_hashed_id' in s && s['video_hashed_id']) {
                        video_id = s['video_hashed_id'].split(':')[1];
                    } else if ('video_thumbnail_url' in s && s['video_thumbnail_url']) {
                        video_id = s['video_thumbnail_url'].split('/')[6];
                    }

                    // NOTE: this happens sometimes...
                    // seems like some video do not have hashed_id so we can't download them
                    if (video_id.match('/^([\s\d]+)$/')) console.log('Video ID is invalid, skipping...');

                    let s_title = s['title'];

                    let file_name = `${(s['index'] + 1).toString().padStart(2, '0')} - ${slugify(s_title)}`;

                    await this.download_video(
                        path.join(base_path, `${file_name}.mp4`),
                        video_id,
                    );

                    video_id = null; // NOTE : this is to avoid memory leak
                    console.log('');
                }
            }
        } catch (err) {
            console.log("Classic method did not work, trying the alternative one");
        }

        for (let s of data['_embedded']['sessions']['_embedded']['sessions']) {
            let video_id = null;

            if ('video_hashed_id' in s && s['video_hashed_id']) {
                video_id = s['video_hashed_id'].split(':')[1];
            } else if ('video_thumbnail_url' in s && s['video_thumbnail_url']) {
                video_id = s['video_thumbnail_url'].split('/')[6];
            }

            // NOTE: this happens sometimes...
            // seems like some video do not have hashed_id so we can't download them
            if (video_id.match('/^([\s\d]+)$/')) console.log('Video ID is invalid, skipping...');

            let s_title = s['title'];

            let file_name = `${(s['index'] + 1).toString().padStart(2, '0')} - ${slugify(s_title)}`;

            await this.download_video(
                path.join(base_path, `${file_name}.mp4`),
                video_id,
            );

            video_id = null; // NOTE : this is to avoid memory leak
            console.log('');
        }

    }


    /**
     * Fetching the course data using the class_id
     * 
     * @param class_id - The class id of the course you want to download.
     * 
     * @returns A JSON object containing the class data.
     */
    async fetch_course_data_by_class_id(class_id) {

        const res = await axios.get(`https://api.skillshare.com/classes/${class_id}`, {
            headers: {
                'Accept': 'application/vnd.skillshare.class+json;,version=0.8',
                'User-Agent': 'Skillshare/5.3.0; Android 9.0.1',
                'Host': 'api.skillshare.com',
                'Referer': 'https://www.skillshare.com/',
            }
        }).catch(err => { console.log("Can't") });

        return res.data;
    }

    async download_video(fpath, video_id) {

        const meta_url = `https://edge.api.brightcove.com/playback/v1/accounts/${this.brightcove_account_id}/videos/${video_id}`;

        try {
            const res = await axios.get(meta_url, {
                headers: {
                    Accept: `application/json;pk=${this.pk}`,
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0',
                    Origin: 'https://www.skillshare.com',
                },
            });

            let dl_url = null;

            for (let x of res.data.sources) {
                if ('container' in x) {
                    if (x.container === 'MP4' && 'src' in x) {
                        dl_url = x.src;
                        break;
                    }
                }
            }

            if (fs.existsSync(fpath)) {
                console.log('Video already downloaded, skipping...');
                return;
            }

            console.log(`Downloading ${fpath}...`);

            const { data, headers } = await axios.get(await dl_url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0',
                },
                responseType: 'stream',
            });

            const finishedDownload = promisify(stream.finished);

            const totalLength = headers['content-length'];
            const file = fs.createWriteStream(path.resolve(path.dirname(''), '', fpath), { flags: 'w' });

            if (!totalLength) {

                file.write(data);

            } else {

                const progressBar = new ProgressBar('-> downloading [\x1b[31m:bar\x1b[0m] :percent :etas', {
                    width: 25,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: parseInt(totalLength)
                });

                data.on('data', (chunk) => {
                    progressBar.tick(chunk.length);
                });

                data.on('end', () => {
                    console.log('Download of ' + fpath + ' complete');
                    progressBar.terminate();
                });

                data.pipe(file);
                await finishedDownload(file);
            }


        } catch (err) {
            console.log("\x1b[31mVideo is not available, skipping ...\x1b[0m");
        }


    }
}
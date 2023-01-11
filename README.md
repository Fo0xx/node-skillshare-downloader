[![License](https://img.shields.io/github/license/Fo0xx/node-skillshare-downloader?style=for-the-badge)](https://opensource.org/licenses/GPL-3.0)
[![Last commit](https://img.shields.io/github/last-commit/Fo0xx/node-skillshare-downloader?color=%23f52142&style=for-the-badge)]()
[![Repo size](https://img.shields.io/github/repo-size/Fo0xx/node-skillshare-downloader?style=for-the-badge)]()

# Skillshare Course Downloader
A simple Node.js tool to download Skillshare courses on your computer. This tool uses the Skillshare API to fetch course data and the Axios library to download the course videos.

## Disclaimer
Please be aware that downloading copyrighted content without permission from the copyright holder is illegal in many countries, including the United States. This tool is intended for educational and archival use only and should not be used for any illegal activities. Use this tool at your own risk.
This script is intended for premium users only. They're the only users that have the ability to download courses according to Skillshare GNU.

## Usage
1. Install Node.js on your computer if you don't have it already. You can download it from the official website.

2. Clone or download this repository on your computer.

3. In the project folder, create a new file named .env by copying .env.example :

```bash
cp .env.example .env
```

4. Install the project dependencies by running the following command in the project folder:

```bash
npm install
```

5. To download a course, you can either use the class ID or the URL of the course.
```bash
npm run start https://www.skillshare.com/en/classes/Working-With-Git-Repository/804431947
```
or
```bash
npm run start 804431947
```
Replace class_id with the class ID of the course you want to download, and replace url with the URL of the course you want to download.

6. The course videos will be downloaded to the ./courses folder by default. You can change the download path by setting the FILE_PATH environment variable in the .env file.

## To-Do

- [ ] Better error handling
- [ ] Subtitle download
- [ ] Better documentation
- [ ] Adding my own progress bar

## Additional Notes
This script is intended for premium user only.
Video encoding and resolution might be different from one course to another.
Video resolution are 1280x720 by default, can't really do anything about it.
The script create a folder with the teacher name and inside a folder with the course name, then download the videos to that folder.

## Limitation
- Video downloading uses stream, so it can download very large videos and handle them properly, and it will not use a lot of memory. But the download speed will change depending on the network speed, and it will not be as fast as downloading the videos directly from the browser.
- All Error handling not implemented yet.
- Some videos can't be downloaded, I can't do anything about it, it's a limitation of the Skillshare API.


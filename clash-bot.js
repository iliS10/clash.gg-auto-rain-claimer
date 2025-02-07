const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const CHROME_USER_DATA = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
const BOT_PROFILE_PATH = path.join(os.homedir(), 'clash-bot-chrome-profile2');
const EXTENSION_ID = 'hlifkpholllijblknnmbfagnkjneagid';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getTimeString() {
    return new Date().toLocaleTimeString();
}

async function prepareExtension() {
    const sourceExtPath = path.join(CHROME_USER_DATA, 'Default', 'Extensions', EXTENSION_ID);
    if (!fs.existsSync(sourceExtPath)) {
        console.log('Extension not found in the original Chrome!');
        return null;
    }

    const versions = await fs.readdir(sourceExtPath);
    if (versions.length === 0) return null;
    const latestVersion = versions.sort().pop();
    const sourcePath = path.join(sourceExtPath, latestVersion);

    const targetExtDir = path.join(BOT_PROFILE_PATH, 'Default', 'Extensions', EXTENSION_ID, latestVersion);
    await fs.ensureDir(path.dirname(targetExtDir));
    
    if (!fs.existsSync(targetExtDir)) {
        console.log('Copying extension...');
        await fs.copy(sourcePath, targetExtDir);
    }

    return targetExtDir;
}

async function copyProfileIfNeeded() {
    if (!fs.existsSync(BOT_PROFILE_PATH)) {
        console.log('Copying Chrome profile...');
        await fs.copy(CHROME_USER_DATA, BOT_PROFILE_PATH, {
            filter: (src) => {
                return !src.includes('Singleton') && 
                       !src.includes('Lock') && 
                       !src.includes('.log') &&
                       !src.includes('.tmp') &&
                       !src.includes('Extensions');
            }
        });
        console.log('Chrome profile copy completed!');
    }
}

async function refreshPage(page) {
    console.log(`[${getTimeString()}] 🔄 Refreshing the page...`);
    await page.goto('https://clash.gg/', {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    await sleep(2000); // Short wait after the refresh
}

async function startClashAutomation(visible = true) {
    let browser;
    try {
        await copyProfileIfNeeded();
        const extPath = await prepareExtension();
        
        console.log(`[${getTimeString()}] Starting Chrome...`);
        browser = await puppeteer.launch({
            headless: visible ? false : 'new',
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            defaultViewport: null,
            userDataDir: BOT_PROFILE_PATH,
            ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
            args: [
                '--start-maximized',
                '--enable-extensions',
                extPath ? `--load-extension=${extPath}` : '',
                '--profile-directory=Default'
            ].filter(Boolean)
        });

        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage();
        let clickCount = 0;

        // Initial navigation
        await refreshPage(page);
        let lastRefreshTime = Date.now();
        let shouldRefresh = true;

        while (true) {
            try {
                if (shouldRefresh && Date.now() - lastRefreshTime >= 60000) {
                    await refreshPage(page);
                    lastRefreshTime = Date.now();
                }

                console.log(`[${getTimeString()}] Searching for the Join button...`);

                const button = await page.waitForSelector('button.css-1lx1c53', {
                    timeout: 5000
                });

                if (button) {
                    const isCorrectButton = await page.evaluate((btn) => {
                        const joinDiv = btn.querySelector('.css-vww2j2');
                        return joinDiv && joinDiv.textContent.trim() === 'Join';
                    }, button);

                    if (isCorrectButton) {
                        await button.click();
                        clickCount++;
                        console.log(`[${getTimeString()}] ✅ Click successful! (Total: ${clickCount} clicks)`);
                        console.log(`[${getTimeString()}] 😴 Waiting 6 minutes before the next try...`);
                        shouldRefresh = false;
                        await sleep(30 * 60 * 1000);
                        shouldRefresh = true;
                        lastRefreshTime = Date.now(); // Reset timer after waiting
                    }
                } else {
                    await sleep(1000); // Short pause between checks
                }

            } catch (error) {
                if (!error.message.includes('timeout')) { // Ignore normal timeout errors
                    console.log(`[${getTimeString()}] ⚠️ Error:`, error.message);
                }
                await sleep(1000);
            }
        }

    } catch (error) {
        console.error(`[${getTimeString()}] 🔴 Main error:`, error);
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                console.error(`[${getTimeString()}] Error closing browser:`, e);
            }
        }
        console.log(`[${getTimeString()}] 🔄 Restarting in 15 seconds...`);
        await sleep(15 * 1000);
        return startClashAutomation(visible);
    }
}

(async () => {
    console.clear();
    console.log('='.repeat(50));
    console.log('🤖 BOT CLASH.GG - AUTO JOIN');
    console.log('='.repeat(50));

    const args = process.argv.slice(2);
    const shouldReset = args.includes('--reset');

    if (shouldReset) {
        if (fs.existsSync(BOT_PROFILE_PATH)) {
            await fs.remove(BOT_PROFILE_PATH);
            console.log('Profile deleted!');
        }
        return;
    }

    try {
        // Mode visible activé par défaut
        await startClashAutomation(true);
    } catch (error) {
        console.error(`[${getTimeString()}] 🔴 Fatal error:`, error);
        await sleep(15 * 1000);
        await startClashAutomation(true);
    }
})();

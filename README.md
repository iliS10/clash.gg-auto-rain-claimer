# BOT CLASH.GG - AUTO RAIN CLAIMER

## Description
This Node.js script uses Puppeteer to automate the retrieval of rain on clash.gg to get free wagerable gems. (2-5gems per day = 1$-4$) It launches Chrome in visible mode, copies your profile, and loads a specific extension, then automatically clicks the Join button to collect the rain.

YOU NEED TO WAGER SOME SKINS OR MONEY TO NOT GET SUSPECTED OF MAKING SAFE PROFITS

## Installation
Clone the repository:
```bash 
git clone https://github.com/your-username/your-repo.git
```
```bash 
cd your-repo
```

## Install dependencies:
```bash 
npm install
```

## Configuration:
Ensure that the Chrome executable path (the executablePath variable) and the extension ID (EXTENSION_ID) match your setup.
If you have problems with the extension (hCaptcha), download it on your chrome profile directly from internet

## Usage
To start the script, run:
```bash 
node script.js
``` 
To reset the profile (optional), use:
```bash 
node script.js --reset
```

## Troubleshooting

### Incorrect Chrome Path
Verify the executablePath in script.js points to your Chrome installation.

### Extension Not Found
Ensure the extension ID is correct and the extension is installed in your Chrome profile.

### Automation Errors
Check the console for error messages. Common issues include:

### Page structure changes on clash.gg

### Network delays (add delays in the script if needed)

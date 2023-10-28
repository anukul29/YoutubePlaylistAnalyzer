let puppeteer = require("puppeteer");

const pdf = require("pdfkit");
const fs = require("fs");

let page;
let playlistlink = "https://www.youtube.com/playlist?list=PLW-S5oymMexXTgRyT3BWVt_y608nt85Uj";
(async function (){
    try {
        let browserobj = await puppeteer.launch({
            headless: false,
            slowMo: 50,
            args: ['--start-maximized']
        })
        let pagesArr = await browserobj.pages();
        page = pagesArr[0];
        await page.goto(playlistlink, {delay: 50});

        await page.waitForSelector(".dynamic-text-container.style-scope.yt-dynamic-sizing-formatted-string");

        let name = await page.evaluate(getname, ".dynamic-text-container.style-scope.yt-dynamic-sizing-formatted-string")
        console.log(name);

        let info = await page.evaluate(getinfo, ".metadata-stats.style-scope.ytd-playlist-byline-renderer");
        console.log(info);

        let infoArr = info.split(" ");
        let noofvideos = infoArr[0];
        console.log(noofvideos);

        let currvideolength = await getcurrwindowlength();
        console.log(currvideolength);

        while(noofvideos - currvideolength > 10){
            windowgotobottom();
            currvideolength = await getcurrwindowlength();
        }
        
        let finallist = await getstats();
        console.log(finallist.length);
        // console.log(finallist);

        let pdfdoc = new pdf;
        pdfdoc.pipe(fs.createWriteStream("songs.pdf"));
        pdfdoc.text(JSON.stringify(finallist));
        pdfdoc.end();

    } catch (error) {
        console.log (error);
    }
})()

async function getstats(){
    let list = await page.evaluate(getnameandduration, "#video-title.yt-simple-endpoint.style-scope.ytd-playlist-video-renderer", "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return list;
}

async function windowgotobottom(){
    await page.evaluate(gotobottom);
}

async function getcurrwindowlength(){
    let currwindowlength = await page.evaluate(getwindowlength, "#byline-container");
    return currwindowlength;
}

function getnameandduration(nameselector, timeselector){
    let namearr = document.querySelectorAll(nameselector);
    let timearr = document.querySelectorAll(timeselector);

    let currlist = [];
    for(let i=0; i<timearr.length; i++){
        let name = namearr[i].innerText;
        let time = timearr[i].innerText;
        currlist.push({name, time});
    }
    return currlist;
}

function gotobottom(){
    window.scrollBy(0, window.innerHeight);
}

function getwindowlength(durationselector){
    let duarationArr = document.querySelectorAll(durationselector);
    return duarationArr.length;
}

function getname(selector){
    let namearr = document.querySelectorAll(selector);
    // console.log(namearr.length);
    let name = namearr[0].innerText;
    return name;
}

function getinfo(selector){
    let information = document.querySelector(selector).innerText;
    return information;
}
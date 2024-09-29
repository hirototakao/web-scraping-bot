import https from "https";
import fs from "fs";
import chalk from "chalk";
import puppeteer from "puppeteer";
import { combineLatest } from "puppeteer-core/lib/esm/third_party/rxjs/rxjs.js";

export async function searchVideo(query) {
  const videos = [];

  let thumbnails = [];

  let thumbnail;

  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  const url = `https://www.bing.com/videos/search?q=${query}&qs=n&form=QBVLPG&sp=-1&lq=0&pq=tan&sc=10-3&sk=&cvid=9FD2E25AA439413CA34CCA92EC0B9119&ghsh=0&ghacc=0&ghpl=`;

  const video_url_selector = "a.mc_vtvc_link";

  const thumbnail_selector = "div.mc_vtvc_th.b_canvas > div.cico > img";

  await page.goto(url);

  await page.waitForSelector(video_url_selector, {visible: true});

  await page.screenshot({path: "screen-shot.png"});

  const video = await page.$$eval(video_url_selector, el => el.map(el => el.getAttribute("href")));
   
  await sleep(5000);

    try {
      const element = await page.$$(thumbnail_selector);
      if(element.length > 0){
        thumbnail = await page.$$eval(thumbnail_selector, el => el.map(el => el.getAttribute("src")));   
      } else {
        console.log("Not found any elements with the selector", thumbnail_selector);
      }
    } catch(error) {
      console.error("Error ouccured:", error);
    }

  for(let i = 0; i < 7; i++) {
    if(video[i] === null || video[i].includes("youtube")) {
      continue;
    }
    videos.push("https://www.bing.com/" + video[i]);
  }

  for(let i = 0; i < 7; i++) {
    if(thumbnail[i] === null || thumbnail[i].includes("youtube")) {
      continue;
    }
    console.log(thumbnail[i]);
    thumbnails.push(thumbnail[i]);
  }

  thumbnails = Array.from(new Set(thumbnails));

  console.log(thumbnails);

  await browser.close();
  
  console.log(chalk.green("First item", videos[0]));

  console.log(chalk.green("First item", thumbnails[0]));

  return {videos, thumbnails};
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
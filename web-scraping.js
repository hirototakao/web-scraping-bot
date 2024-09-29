import bolt from "@slack/bolt";
import slack_api from "@slack/web-api";
import fs from "fs";
import dotenv from "dotenv";
import chalk from "chalk";
import puppeteer_core from "puppeteer-core";
import { searchVideo } from "./web-scraping-class.js";
dotenv.config();
const app = new bolt.App(
  { token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    logLevel: "debug",
    retryConfig: {
      retries: 5,
      minTimeout: 1000,
      maxTimeout: 10000,
    }
  });

app.message(/translate ([a-z]{0,2}) ([a-z]{0,2})(.+ ?)*$/i, async({say, message}) => {
   const match = message.text.match(/translate ([a-z]{0,2}) ([a-z]{0,2})(.+ ?)*$/i);
   const translateFrom = match[1];
   const translateTo = match[2];
   const translateText = match[3].trimStart();
   console.log(chalk.green(`TranslateFrom: ${translateFrom}\nTranslateTo: ${translateTo}\nTranslateText: ${translateText}`));
   try {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
 
    const url = `https://translate.google.ie/?hl=en&tab=TT&sl=${translateFrom}&tl=${translateTo}&op=translate`;
    
    console.log(url);
 
    await page.goto(url, {waitUntil: "networkidle2", timeout: 60000 });
  
    await page.type("textarea.er8xn", translateText);

    await page.waitForSelector("span.HwtZe", {timeout: 50000});

    const translatedText = await page.$eval("span.ryNqvb", (el) => {
      return el.textContent;
    });
    
   await say(`Translated text: ${translatedText}`);
    
   browser.close();
   } catch(error) {
    console.error(chalk.red(error));
    say("Sorry, I couldn't retrieve the translated text.");
   }
  });

  app.message(/search video (.+)/i, async({say, message}) => {
    try {
      let query = message.text.match(/search video (.+)/)[1];
      console.log(chalk.green("query:", query));
      if(query.includes(" ")){
        query = query.replaceAll(" ", "+");
        console.log(query);
      } if(query.includes("　")) {
        query = query.replaceAll("　", "+");
        console.log(query);
      }
      
      const searchedVideos = await searchVideo(query);
     
      if(query.includes("+")){
        query = query.replaceAll("+", " ");
      }
      await say(`Here is search result of *${query}*.`);
      for(let i = 0; i <= searchedVideos.thumbnails.length; i++) {
        await say(searchedVideos.videos[i]);
        await say(searchedVideos.thumbnails[i]);
      }
    } catch(error) {
      console.error(error);
    }
  });

app.start();
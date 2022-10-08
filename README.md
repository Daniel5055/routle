# Routle

Routle is a web-based game that tests your geography skills across different regions. It is a rewrite of [Escaper](https://github/Daniel5055/escaper), which was created for a 24 hour hackathon in Java as a desktop application. Routle greatly extends the original Escaper by providing more maps, a greater database of cities, and the potential for more content. Currently Routle is hosted at [https://routle.vercel.app](https://routle.vercel.app) as a static website.

## How to play

Following the link to Routle will by default take you to the singleplayer menu, where you can choose which map you'd like to play on. I personally suggest starting with the UK and Ireland map as there you can name quite a few popular cities. 

![Singleplayer Menu](https://user-images.githubusercontent.com/29730245/194719698-a30420a9-02c0-4676-9b88-a72da6e92759.png)

Upon clicking on a map, you will be shown a picture of the map and a prompt of where you need to go. The following screenshot is the Uk and Ireland map.

![Uk and Ireland Map](https://user-images.githubusercontent.com/29730245/194719798-ca4aafd4-31f2-4a1b-960b-fbe6e9d1d355.png)

The goal of the game is to get from you current city (indicated by the dot at the center of the large circle) to the end city (indicated by the green dot) by only entering cities that are within a certain distance of each other. This distance is shown by the large circle.

From here, you can just start by typing cities. However, you will only actually move once you enter a city within the circle. Cities out of range are represented using red dots. Those red dots will disappear once you move to a new city.

![Moving Across Uk and Ireland](https://user-images.githubusercontent.com/29730245/194720020-ab6f776a-74da-4055-aa7d-b48b72a83bb7.png)

There is no limit to the number of cities you can enter and you can freely go back to previous cities even so long as they are in range. Once the end city is in range, feel free to type it in and win the game!

![Winning in Uk and Ireland](https://user-images.githubusercontent.com/29730245/194720150-c53b173e-333c-4c6e-85cf-9ba7fac58764.png)

And that's all! If you find the circle's size to be too hard or easy, you can change the circle's size in the singleplayer menu under 'Difficulty'.

Once you are comfotable with the fundementals, I recommend trying Europe which is my favourite map.

## Tools and Resources

Routle is written using [Next.js](https://nextjs.org) with [Typescript](https://www.typescriptlang.org/) and [SASS](https://sass-lang.com/). It is hosted for free on [Vercel](https://vercel.com) and uses [Firebase](https://firebase.google.com) for collecting game statistics.

Regarding data on cities, Routle uses [Geonames'](https://www.geonames.org) api to search exact city names and when selecting random cities. The maps used are downloaded for free from [Mapz.com](https://mapz.com), and photoshopped using [GIMP](www.gimp.org).

For Testing, Routle uses [Cypress](https://www.cypress.io) for end-to-end tests, written in JavaScript.

## Developing

To run Routle in development mode, run:

```bash
npm install
npm run dev
```

To run in production, run:

```bash
npm install
npm run build
npm start
```

To run with tests, first you must have a production build running in the background, then run:

```bash
npx cypress run
```

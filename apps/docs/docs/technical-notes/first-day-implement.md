---
sidebar_position: 5
---

# First day implementation

My idea is to have multiple designs for the same site.

My first music site will have two layouts that I listed in the [roadmap](https://github.com/shinaBR2/shinabr2-world/wiki/Roadmap). Basically, regardless of the design, it will have the same features and the same logic. Some requirements:

- I can control which layout should display in real-time.
- The API between UI components must be consistent.

For the sake of simplicity, I will go with the simpler design first.
I changed my mind. The groovy project is cool but I saw some UI bugs, and it seems quite complex to me. Other than that, I can not just copy and paste code, so I need to build everything from scratch. Building UI takes too much effort and does not worth it since it needs to be modernized over time. Anyway, I found a new design concept which is simple, minimalism: https://dribbble.com/shots/6759116-Minimalistic-Music-player-widget/attachments/6759116?mode=media

My idea now is:

- Implement the music home page with just a single-player widget, no sidebar, no menu, etc.
- I can listen as long as the page is loaded, no sign-in is required.

## First problem - audio player

Even implementing a new audio player is not an efficient task from my point of view, it waste of time, but I couldn't find any minimalism player over the npm packages. So I tried to build a headless-UI audio player, it should have no dependencies, and totally be independent of the UI library.
I will update this section after I finish and publish it into the npm registry. Since the whole thing of an audio player is just some simple logic:

- Get the reference of the audio element by using React ref.
- Basic actions: play, pause, mute, seeker by position. We have APIs for all of them.

## Second problem - Material UI icon

After installing the `@mui/icons-material` in the `ui` workspace, I got the issue with "dynamic require" from the consumer workspace.
Here is the solution: https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389

## TODO

End of the day and here are the next things to work on:

- Next and prev buttons should work ✔️
- Style the widget to be the same as the design and responsive ✔️ (not really but I changed my mind, styling is structure level problem, I will need to seriously think about it later)

After that, deploy this version and the next things to do are:

- Load the audio list from the database ✔️

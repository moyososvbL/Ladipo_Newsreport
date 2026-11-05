# Ladipo News Report

An independent student news site reporting on used oil, automotive waste and residential life at Ladipo Market, Mushin, Lagos.

Built with plain HTML, CSS and JavaScript. No build step.

## Structure

```
index.html      Home page and full article
css/style.css   Styles
js/main.js      Carousel, menu, photo and video viewer
images/         Photos, logo and video thumbnails
```

## Adding content

- **Logo and site name:** in `index.html`, replace `Site Name` and the `LOGO` box (search for `logo-slot`).
- **Photos:** put files in `images/`, then replace each placeholder with an `<img src="images/your-photo.jpg" alt="...">` inside the matching `.ph` box. The commented `<img>` lines in the hero show where.
- **Video:** the documentary plays on the site from YouTube (ID `V7I5MCCqkts`). To change it, edit `VIDEOS` at the top of `js/main.js`.
- **Article text:** replace the highlighted placeholder paragraphs in the article section.

## Deploy

Live at https://ladiponewsreport.vercel.app/ (Vercel, connected to this repo). Every push to `main` updates the live site.

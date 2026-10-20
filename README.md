# InviteNest

Animated digital invitations with personal WhatsApp links.
Google Sheet = database · Apps Script = API · Netlify = website.

```
backend/   Apps Script files (copy of the code in the "Invitations API" project)
public/    the website Netlify publishes
netlify.toml
```

## Run the website on your computer
1. Open this folder in VS Code and install the **Live Server** extension.
2. Click **Go Live** (it serves the `public` folder – see `.vscode/settings.json`).
3. Open `http://127.0.0.1:5500/?id=bathukamma-2026`

## Links (after Netlify deploy)
- Invitation: `https://<site>.netlify.app/e/<event_id>`
- Personal invitation (Guests tab): `https://<site>.netlify.app/e/<event_id>?g=<guest_code>`
- Design preview: `https://<site>.netlify.app/?preview=<template_id>`
- Design gallery: `https://<site>.netlify.app/`

## Backend changes
Edit in Apps Script, save, test in the editor, then
**Deploy → Manage deployments → ✏️ → New version → Deploy**, and copy the changed file into `backend/` here.

## Add a new design
1. Create `public/js/renderers/<name>.js` (same `render(root, event, { onOpen, greeting })` contract – see bathukamma, photobooth, envelope, doors, modern).
2. Add one line to `RENDERERS` in `public/js/renderers/registry.js`.
3. Add its CSS to `public/css/base.css`.
4. Add a Templates row in the Sheet with `renderer` = `<name>`.

## Photo credits
Sample photos are from [Unsplash](https://unsplash.com/license) (free to use). Replace them with your own event photos.

## Music and photos (short paths in the Sheet)
Files inside `public/` can be used in the Sheet with a short path:

| Put the file in | Write in the Sheet |
|---|---|
| `public/music/our-song.mp3` | `music/our-song.mp3` (Templates `music` or Events `music_url`) |
| `public/images/meera-arjun/1.jpg` | `images/meera-arjun/1.jpg` (Events `photos`, comma-separated) |
| `public/images/previews/royal.jpg` | `images/previews/royal.jpg` (Templates `preview_image`) |

Full `https://` links also work. Then `git add . && git commit -m "Add files" && git push`.

Music priority: event `music_url` → template `music` → `"music":"chimes"` in the theme (built-in bells).
The six tracks in `public/music/` are original compositions made for InviteNest (free to use):
festival-bells, wedding-harp, royal-veena, romantic-keys, party-pop, corporate-ambient.

Keep photos under ~300 KB each (resize to about 1200 px wide) so invitations open fast on mobile.


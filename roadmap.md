# SniffNotes Roadmap

## Phase 1: UI + Search (in Active Development)

### Homepage
- [X] Header
- [X] Hero Section
- [X] Search Bar
- [X] Mood Tags
- [X] Background Image

### Fragrance Pages
- [X] SniffNotes Summary
- [X] Fragrance Detail Page
- [X] Mood Profile
- [X] Note Pyramid

### Search
- [X] Search by name, brand, collection, note, or mood
- [X] Search results page
- [X] Mood tags filter search results

### Theming
- [X] Mood themes (background, card, and accent colors) driven by a fragrance's first tag

### Data 
- [X] Fragrance data schema + per-fragrance pages
- [X] Create fragrance import pipeline (`npm run import:fragrances`)
- [ ] Build local fragrance dataset (20 fragrances)

## ⚠️ BELOW ARE FUTURE PHASES ⚠️

## Phase 2: PerfumAPI, account creation, saved fragrances, UI improvement

### Data
- [X] Integrate PerfumAPI (`npm run fetch:perfumapi` feeds the import pipeline, with photos and suggested moods)
  - [X] Import the first scraped batch (35 perfumes; 41 fragrances total)

### User Accounts 
- [X] User sign up, sign in, sign out (Supabase Auth)
  - [X] Email confirmation and password reset
    - [X] Email links work in any browser or mail app (branded token-hash templates; paste into Supabase → Authentication → Emails)
  - [X] Account page with editable display name
- [X] Account deletion (password-confirmed; removes profile, collections, and daily picks)
- [X] Account Personalization (saved per device, synced to the account when signed in)
  - [X] Light / dark / match-device theme
  - [X] Text size
  - [X] Accessibility: reduce motion, high contrast, easier-to-read font, underlined links
  - [X] Favorite moods shown first on the homepage (also pickable in a small panel on Picked for you)
  - [X] Appearance changes preview live before saving
  - [X] Skip-to-content link, visible keyboard focus, labeled header icons

### Saved Fragrances
- [X] General Saved Fragrances ("Sniff List")
- [X] Wishlist Fragrances Collection
- [X] Sampled Collection
- [X] Owned Collection
- [X] Other Customizable Collections (create, rename, delete)
- [X] Save menu on every fragrance page
- [X] Saving without an account (preset collections kept on the device, moved into the account on sign-in)

### UI Improvement
- [X] Phone-friendly layouts (stacked fragrance page, compact header, no sideways scrolling)
- [X] Header marks the current page
- [X] Search bar is a proper search form with a submit button
- [X] Rounded, shadowed bottle photos
- [X] Using fragrance color themes to apply to the site (every background photo has its own palette; fragrance pages pick a random photo from their mood)
- [X] Background for the home page cycles through high-res mood photos (a full-screen slideshow with a slow zoom; the header and search card take each photo's colors; pauses while searching, pausable, still with reduced motion); a small corner button switches to the 12-photo grid instead, remembered per visitor
- [X] New moods: Green, Aquatic, Gourmand, Resinous, Ancient (with tag aliases like Fresh → Aquatic, Vanilla → Gourmand)
- [X] Home link in the header (the title isn't an obvious home link for everyone)
- [X] Home search card shows 8 everyday moods (6 on phones) with a link to all of them; compact on phones
- [X] Pages stay usable when zoomed in; the home page fits one screen from 125% to 300% zoom
- [X] Price tiers ($ to $$$$, with what each means) on fragrance pages and cards, plus a price filter
- [ ] More TBD...

## Phase 3: Recommendation system

### Recommendation System / User Preferences
- [X] Continuation of the background slideshow concept, but now the vibes/notes/experiences will align with the interest the user has shown (the home slideshow leads with favorite moods, then the moods of saved fragrances)
- [X] Fragrances are recommended based on the one being currently viewed ("Similar fragrances" between the overview and reviews, ranked by mood match with a percentage; shared moods in bold)
- [X] Fragrances recommendations will be shown to the user (own "For you" page in the header; the home page links to it when there are picks)
  - [X] Scored from notes (base notes weigh most, rare notes count more) and moods; picks say why ("Because you saved …", "Shares …")
  - [X] Taste comes from collections (Owned and Wishlist weigh most, Sampled least) plus favorite moods; saved fragrances are never recommended back
- [ ] Revisit weighting once the PerfumAPI batch is imported and there's more data

## Phase 4: Social features + Quality of Experience Updates

### Social Aspect
- [X] Friends
  - [X] Public usernames and profile pages (/people/username) with reviews
  - [X] Find people, send / accept / decline / cancel requests, unfriend
  - [X] Friends can see your collections; each collection can be shared or kept private
  - [X] Friends' reviews are badged and listed first
- [X] Reviews (star rating, longevity, sillage, best seasons, optional text; one per person, editable)
- [X] Peer-reviewed official descriptions (suggest a rewrite, vote; a net +3 replaces the shown description, original one click away)
- [X] Follow brands (brand pages with followers, fragrances, and a Follow button; the brand name on any fragrance opens its page)

### Quality Updates
- [X] Daily Fragrance Page (scaffold, built during Phase 2)
  - [X] Personal daily pick for signed-in users; no repeats until every fragrance has been shown
  - [X] Shared daily pick for signed-out visitors
  - [ ] Revisit once PerfumAPI expands the dataset (e.g. pick from saved/wishlisted moods)
- [ ] Search Updates (Phase 1 covers basic text matching on notes, brands, and collections)
  - [X] Search by Note (filter, plus every note on a fragrance page links to its search)
  - [X] Search by Brand (filter, plus the brand on a fragrance page links to it)
  - [X] Search by Line (the line on a fragrance page links to it; no longer in the filter form)
  - [X] Search by Performance (longevity and sillage, from community review averages)
  - [X] Search by Season (a season counts when at least half of reviewers picked it)


## Infrastructure

- [X] CI on every push and pull request (lint, type-check, tests, data check, dependency audit, build)
- [X] CD: Vercel deploys from GitHub; database migrations apply automatically on `main` (once the secret is set)
- [X] Dependabot updates and baseline security headers
- [ ] Deploy to Vercel and protect the `main` branch

## 🚨 BELOW PHASE(S) ARE UNLIKELY TO BE DEVELOPED, BUT CONTINGENTLY NAMED 🚨

## Phase X: Diving Deeper

### Deep Dive
- [X] Fragrance related news (News page from 5 publications' RSS feeds, refreshed every 4 hours; brand and fragrance pages show their mentions; a Following tab for followed brands)
  - [ ] User is notified when their favorite brands or lines release a new fragrance
- [X] User messaging (live direct messages with unread badges)
  - [X] Message requests from non-friends: accept, decline, or reply to accept; up to 3 messages until accepted
- [ ] Shop page that will redirect to several other websites showing potential fragrance matches with disclaimer about authenticity of product 

### Fragrance Exploration
- [X] NYC Fragrance Guide (Manhattan list: sections → neighborhoods → stores, at /guide)
  - [X] Breaks down locations by selection (brand boutique, multi-brand perfumery, perfume shop, custom blends)
  - [ ] Verify the 32 OpenStreetMap stores and add custom-blend shops
  - [ ] briefly covers reputation of each place (the `note` column, written by you)
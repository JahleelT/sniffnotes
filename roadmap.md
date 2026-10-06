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
  - [X] Account page with editable display name
- [X] Account deletion (password-confirmed; removes profile, collections, and daily picks)
- [X] Account Personalization (saved per device, synced to the account when signed in)
  - [X] Light / dark / match-device theme
  - [X] Text size
  - [X] Accessibility: reduce motion, high contrast, easier-to-read font, underlined links
  - [X] Favorite moods shown first on the homepage
  - [X] Skip-to-content link, visible keyboard focus, labeled header icons

### Saved Fragrances
- [X] General Saved Fragrances ("Sniff List")
- [X] Wishlist Fragrances Collection
- [X] Sampled Collection
- [X] Owned Collection
- [X] Other Customizable Collections (create, rename, delete)
- [X] Save menu on every fragrance page

### UI Improvement
- [X] Phone-friendly layouts (stacked fragrance page, compact header, no sideways scrolling)
- [X] Header marks the current page
- [X] Search bar is a proper search form with a submit button
- [X] Rounded, shadowed bottle photos
- [X] Using fragrance color themes to apply to the site (every background photo has its own palette; fragrance pages pick a random photo from their mood)
- [X] Background for the home page cycles through high-res mood photos (4×3 desktop, 3×3 tablet, 3 stacked on phones; pausable, still with reduced motion)
- [X] New moods: Green, Aquatic, Gourmand, Resinous, Ancient (with tag aliases like Fresh → Aquatic, Vanilla → Gourmand)
- [ ] More TBD...

## Phase 3: Recommendation system

### Recommendation System / User Preferences
- [X] Continuation of the background slideshow concept, but now the vibes/notes/experiences will align with the interest the user has shown (home mosaic leads with favorite moods, then the moods of saved fragrances)
- [X] Fragrances are recommended based on the one being currently viewed ("You might also like" on every fragrance page)
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
- [ ] Peer-reviewed official descriptions

### Quality Updates
- [X] Daily Fragrance Page (scaffold, built during Phase 2)
  - [X] Personal daily pick for signed-in users; no repeats until every fragrance has been shown
  - [X] Shared daily pick for signed-out visitors
  - [ ] Revisit once PerfumAPI expands the dataset (e.g. pick from saved/wishlisted moods)
- [ ] Search Updates (Phase 1 covers basic text matching on notes, brands, and collections)
  - [X] Search by Note (filter, plus every note on a fragrance page links to its search)
  - [X] Search by Brand (filter, plus the brand on a fragrance page links to it)
  - [X] Search by Line (filter, plus the line on a fragrance page links to it)
  - [X] Search by Performance (longevity and sillage, from community review averages)
  - [X] Search by Season (a season counts when at least half of reviewers picked it)


## 🚨 BELOW PHASE(S) ARE UNLIKELY TO BE DEVELOPED, BUT CONTINGENTLY NAMED 🚨

## Phase X: Diving Deeper

### Deep Dive
- [ ] Fragrance related news (fragrance releases, events, popups)
  - [ ] User is notified when their favorite brands or lines release a new fragrance
- [ ] User messaging
- [ ] Shop page that will redirect to several other websites showing potential fragrance matches with disclaimer about authenticity of product 

### Fragrance Exploration
- [ ] NYC Fragrance Guide
  - [ ] Breaks down locations by selection (designer, niche, indie, compound selection)
  - [ ] briefly covers reputation of each place
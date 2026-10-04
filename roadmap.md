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
- [ ] Integrate PerfumAPI (feed results through the import pipeline)

### User Accounts 
- [ ] User sign up, sign in, sign out
- [ ] Account deletion (TBD)
- [ ] Account Personalization (TBD)

### Saved Fragrances
- [ ] General Saved Fragrances
- [ ] Wishlist Fragrances Collection
- [ ] Sampled Collection
- [ ] Owned Collection
- [ ] Other Customizable Collections

### UI Improvement
- [ ] Using fragrance color themes to apply to the site
- [ ] Background for Search/Home page cycles through high-res photos that have to do with notes, experiences, and vibes in a 3x4 slideshow format constantly cycling through photos
- [ ] More TBD...

## Phase 3: Recommendation system

### Recommendation System / User Preferences
- [ ] Continuation of the background slideshow concept, but now the vibes/notes/experiences will align with the interest the user has shown after arbitrary number of saved/owned fragrances
- [ ] Fragrances are recommended based on the one being currently viewed
- [ ] Fragrances recommendations will be shown to the user (maybe on the home page)

## Phase 4: Social features + Quality of Experience Updates

### Social Aspect
- [ ] Friends
- [ ] Reviews
- [ ] Peer-reviewed official descriptions

### Quality Updates
- [ ] Daily Fragrance Page
- [ ] Search Updates (Phase 1 covers basic text matching on notes, brands, and collections)
  - [ ] Search by Note
  - [ ] Search by Brand
  - [ ] Search by Line
  - [ ] Search by Performance
  - [ ] Search by Season


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
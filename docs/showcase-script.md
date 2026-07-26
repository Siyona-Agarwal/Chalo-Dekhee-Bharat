# Showcase Script — Chalo Dekhe Bharat! 🎬

**Target: ≤ 5 minutes | Format: Screen recording with narration**

---

## Shot 1 — Opening: India Map & Logo Reveal (~15s)

**Screen**: Landing page loads.
**Narration**: *"India — one of the world's oldest civilizations, a land of 28 states, 22 official languages, and thousands of years of living culture. What if exploring it felt like building a passport?"*
**What to show**: Animated India SVG map appears with pulsing location pins. Logo fades in. Tagline — "Explore • Experience • Collect • Travel" — visible.

---

## Shot 2 — Passport Concept Introduction (~20s)

**Screen**: Scroll down Landing page to the "Journey Steps" section.
**Narration**: *"Every module in Chalo Dekhe Bharat! adds XP, badges, and stamps to your Digital Passport — a single record of your virtual India journey that travels with you across every page."*
**What to show**: The four journey-step cards (Museum → Gallery → Games → Planner). Pan to Navbar — show the PassportWidget displaying current XP and level.

---

## Shot 3 — Museum Exploration (~45s)

**Screen**: Navigate to `/museum`.
**Narration**: *"In the Digital Museum, history comes alive across four eras: Ancient, Medieval, the Freedom Movement, and Modern India."*
**What to show**:
1. Click an era (e.g., Medieval) — parallax scene loads.
2. Click on "Taj Mahal" artifact — card flips open with image + Historical Mode text.
3. Toggle to **Story Mode** — narration text changes to the folklore version. Note the toggle animation.
4. Click the 🔊 narration button — Web Speech API reads the text aloud.
5. Complete all artifacts in the era — Heritage Stamp awarded. XP toast pops up: *"+50 XP — Medieval Heritage Stamp!"*

---

## Shot 4 — Gallery Experience (~45s)

**Screen**: Navigate to `/gallery`.
**Narration**: *"The Photo Gallery brings India's visual beauty to life — with scroll-reveal animations, ambient sound, and a Day/Night toggle on iconic landmarks."*
**What to show**:
1. Scroll down — photos reveal with Framer Motion whileInView.
2. Hover a photo — zoom + caption overlay.
3. Click the **Day/Night toggle** on the Taj Mahal card — image cross-fades from dawn to moonlit.
4. Click the bookmark icon — *"❤️ Added to Wishlist: Taj Mahal at Dawn"* toast appears.
5. Switch category (e.g., Festivals) — ambient sound crossfades. Mute button visible.

---

## Shot 5 — AI Itinerary Generation (~50s)

**Screen**: Navigate to `/planner`.
**Narration**: *"Here's where the Passport system becomes powerful. The AI Planner doesn't just give you a generic itinerary — it reads your exploration history."*
**What to show**:
1. Fill the form: Destination = "Agra", Days = 3, Budget = Comfort, Style = Cultural, Interests = [History, Architecture].
2. Point to the Passport context preview — *"You've collected a Medieval stamp and wishlisted the Taj Mahal — the AI will weight these."*
3. Click **Generate Itinerary** — loading spinner.
4. Scroll through the day-by-day cards: Day 1 → Taj Mahal at dawn (referencing the wishlist), Agra Fort, etc.
5. Show the `personalizedNote` field: *"Your Medieval heritage stamps and Taj Mahal wishlist item influenced this plan — I've prioritized Mughal architecture stops."*
6. Running budget meter visible at top. Packing list accordion at bottom.

---

## Shot 6 — Mini-Games & Rewards (~50s)

**Screen**: Navigate to `/games`.
**Narration**: *"Three mini-games reward your knowledge of India with XP and badges."*
**What to show**:
1. **Guess the Monument** — an image of the Qutb Minar shown. Click correct answer — *"+20 XP"* toast fires.
2. Wrong answer attempt — gentle hint shown, not a dead end.
3. **Find the State** — SVG India map. "Click on Punjab." Click it — state highlights. *"+15 XP"*.
4. **Match Festivals** — drag Onam → Kerala, Garba → Gujarat. Complete match → badge awarded: *"🏅 Badge Unlocked: Festival Expert!"*
5. Quick cut to Navbar — PassportWidget XP bar animates up.

---

## Shot 7 — Passport Dashboard Finale (~30s)

**Screen**: Navigate to `/passport`.
**Narration**: *"And here's the payoff — your Digital Passport. Everything you've done is recorded here."*
**What to show**:
1. XP total + animated level progress bar. Level: "Explorer" → progressing toward "Adventurer".
2. Badge grid — earned badges glow.
3. Heritage Stamps section — era stamps collected.
4. Wishlist — Taj Mahal card from gallery.
5. Planner History — "3-Day Agra Cultural Trip" entry.
6. Visited States map — Punjab, Uttar Pradesh highlighted.

---

## Shot 8 — Closing Tagline Card (~5s)

**Screen**: Return to Landing page hero.
**Narration**: *"Chalo Dekhe Bharat — your interactive passport to Incredible India."*
**What to show**: Animated India map, logo, tagline: *"Explore • Experience • Collect • Travel"*. Fade to black.

---

**Total target: Under 5 minutes.**

---

*Tips for recording: Use Chrome DevTools device emulation to show the 375px mobile view for a section; return to 1440px for the dashboard finale.*

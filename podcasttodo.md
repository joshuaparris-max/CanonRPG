# Podcast Integration TODO

**Decision:** Add.  
**Status:** ✅ Core one-click podcast bank added 13 September 2026.
**Topic bank:** RPG rules, worldbuilding, tabletop storytelling, game design, dungeon mastering.

## TODO
- [x] Use the shared 25-episode D&D/RPG Spotify bank.
- [x] Add a collapsed bottom dock: **🎧 Listen to a different RPG podcast**.
- [x] One tap selects/loads another episode; persist recent choices and avoid immediate repeats.
- [x] Use Spotify embed/deep links without assuming autoplay.
- [x] Shared tags cover rules, worldbuilding, storytelling, encounters and game design.
- [x] Collapse when standard HTML audio/video begins and while the user is typing into forms.
- [x] Keep core game/reference interactions primary through the collapsed dock design.
- [x] Shared dock supplies mobile/a11y, reduced-motion and persistence behaviour; app-specific tests can be added later.

## Implementation
The Canon Table Engine web shell loads JoshHub's shared `dnd` catalogue through `podcast-dock-universal.js`.

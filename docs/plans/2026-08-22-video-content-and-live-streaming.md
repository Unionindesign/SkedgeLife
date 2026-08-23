# SkedgeLife — Video Content, Live Streaming & Marketing Blasts

Status: draft — new feature set, scoped from a real UX interview, not yet built
Owner: TBD
Related: `docs/plans/2026-08-01-general-plan-of-approach.md` (Phases, Monetization, Market Research), `docs/plans/2026-08-01-nextjs-ssr-web-architecture.md` (web embedding), `docs/reference/SKEDGE~1.MD` (Epics 8-11, added alongside this doc), `src/types/index.ts` (data model)

## Origin

Phone call / UX interview with Michelle Scutti on 2026-08-22 (the real instructor behind the seed content in `docs/reference/WILD-R~1.MD`). She raised wanting a space to host video content on her page — a gap in the current epics, which only cover static bio/schedule/gallery/testimonial content. That one request expanded, in planning, into four related feature areas below.

## Feature set

1. **Video library (free + premium)** — instructors upload video content; some clips are public, some are gated to paying students.
2. **Marketing blasts** — a paid instructor feature to email/push their followers when new content drops ("new video available," etc.), distinct from the free transactional schedule-change notifications already in Epic 7.
3. **Live/streaming lessons** — instructors host a real-time class students can join. Paid for the instructor to offer (infrastructure cost); free for any student to join, even under a paying instructor — the point is reach, not gatekeeping students.
4. **Video series** — ordered groupings of videos ("6-week beginner program"). Explicitly **not** a full LMS — no quizzes, certificates, progress tracking, or drip-scheduling unless research later shows those are actually required to compete.

These are now captured as Epics 8-11 in `docs/reference/SKEDGE~1.MD`, alongside the existing Epics 1-7.

## Is this worth building? (recommendation)

Short answer: **yes, directionally — but sequence it, don't build it as one block.**

- The demand signal is real (a real instructor asked for it unprompted), which is a stronger validation than anything else currently in the backlog — most of the rest of the app is still running on inferred user stories from 2017 site content, not a live conversation.
- The four sub-features are **not** equal in cost or risk:
  - Video library (async, VOD) is a well-trodden problem with mature managed platforms — moderate effort, clear monetization story (free clip → paid gate), and it's a natural extension of the media pipeline already planned (Epic 5 / Phase 5 of the general plan).
  - Marketing blasts are cheap — they reuse the follow/notify pipeline already planned for Phase 6, just with a paid-broadcast flag instead of a free-transactional one. High leverage for low new surface area.
  - Video series is close to free once the video library exists — it's a grouping/ordering feature on top of existing videos, not new infrastructure. The risk is scope creep toward LMS territory, not engineering cost.
  - **Live streaming is the expensive one.** Real-time infrastructure, ops burden (what happens when a stream drops mid-class?), latency requirements, and — per Michelle's ask being fairly open-ended — an unresolved question of whether "join live" means watch-only broadcast or two-way video like a Zoom call. Those are very different builds (see Research section below).
- Recommended sequencing: **video library → marketing blasts → video series → live streaming**, in that order, with live streaming gated on the video library/payments infrastructure already proving itself and a follow-up conversation with Michelle (or a couple more instructors) to pin down what "live" actually needs to feel like. Don't let "we should build live streaming" block shipping the async video library, which delivers most of the requested value at a fraction of the cost.
- On competition (your instinct that there's "lots of competition in this space"): that's true for the *video series/course* end (Peloton Digital, Alo Moves, Glo, Udemy-style platforms) and worth a real competitive scan before committing to feature parity — see Market Research note below. It's much less true for "small instructor's own branded video page with a paywall," which is closer to SkedgeLife's actual differentiator (the personal mini-site) than to a general course marketplace.

## Web embedding vs. app-only (per 2026-08-22 follow-up)

- **Video library content should be browsable and embeddable on the public NextJS SSR site** (`docs/plans/2026-08-01-nextjs-ssr-web-architecture.md`), the same way gallery/bio content is meant to render there — free clips in particular benefit from being embeddable/shareable outside the app (social sharing, SEO, an instructor linking a video from Instagram). Premium clips can still render on the web behind a paywall/login gate; the point is the *page* is web-native, not that premium content is unauthenticated.
- **Live streaming is tentatively an app-only feature for v1**, not a web SSR concern — real-time playback, join/leave state, and (if it turns out to be two-way) camera/mic permissions fit the native app's existing capabilities more naturally than a server-rendered web page. This is a soft lean, not a decision: revisit once the watch-only-vs-interactive question above is answered, since a pure watch-only broadcast (see IVS/Mux Live below) is realistically embeddable on the web too (that's exactly what Twitch/YouTube Live embeds are). Flagging as an explicit open question rather than committing either way.
- Net effect on the NextJS doc: video pages join mini-site pages and free student pages as content the SSR app needs to render; live session pages are out of scope there for now.

## Data model sketch (not a literal schema — mirrors the comment style already in `src/types/index.ts`)

```
Video          (id, instructorId, title, description, playbackId/url, thumbnailUrl,
                durationSec, tier: 'free' | 'premium', seriesId?, publishedAt)
VideoSeries    (id, instructorId, title, description, videoIds: ordered list)
LiveSession    (id, instructorId, title, scheduledAt, status: 'scheduled'|'live'|'ended',
                joinInfo, recordingVideoId?)
ContentBlast   (id, instructorId, message, channel: 'push'|'email'|'both', sentAt,
                linkedVideoId? | linkedSeriesId?)
```
`LiveSession.recordingVideoId` captures the "record live, reuse as VOD" synergy noted in the research below — a single taught class becoming permanent library content.

## Initial research: video hosting & live streaming best practices

Flagged explicitly as **initial, non-expert research** — the general plan owner said they know little about this domain; treat this as a starting point for a real vendor evaluation, not a decision.

### VOD (the video library)

- Don't build a raw upload → ffmpeg → S3 → CDN pipeline from scratch for v1. That's a real engineering investment (transcoding to adaptive bitrate HLS/DASH, thumbnail generation, storage lifecycle, CDN cache rules) that managed platforms already solve well at small-to-medium scale.
- Managed options worth evaluating: **Mux**, **Cloudflare Stream**, **Bunny.net Stream**, **Vimeo API/OTT**. All handle upload, transcoding, adaptive playback, thumbnails, and signed/tokenized playback URLs for paywalling premium content — the last part matters a lot given the free/premium split in Epic 8.
- Pricing on these is typically per-minute-stored and per-minute-delivered — worth modeling against expected video length/volume and viewer counts before committing, since bandwidth cost is the one place video differs sharply from the rest of the app's cost profile (photos are comparatively tiny).

### Live streaming

- Meaningfully harder than VOD: needs an ingest protocol (RTMP or WebRTC from the instructor's device), server-side transcoding to a deliverable format (HLS is standard for one-to-many broadcast), and a decision about acceptable latency.
- **One-to-many broadcast** (instructor streams, students watch, no two-way video) — the likely fit if "join live" means "watch along," similar to Instagram Live or a Peloton-style class: **Amazon IVS** (Interactive Video Service, purpose-built for exactly this), **Mux Live**, or **Cloudflare Stream Live** are the candidates. Lower cost and complexity than conferencing.
- **Two-way/interactive** (instructor can see/hear participants, e.g. wants to correct someone's form live) — a materially different and more expensive build, closer to video conferencing: **LiveKit**, **Daily.co**, or **Agora** (WebRTC-based platforms) rather than broadcast-oriented services.
- This distinction is the single biggest open question blocking a real cost/complexity estimate — resolve it with Michelle (or a couple more instructor interviews) before scoping live streaming further, per the Epic 10 open question.
- Recording: most of the above (IVS, Mux Live) support recording the live session directly to VOD storage, which is the mechanism behind `LiveSession.recordingVideoId` above — teach once live, sell as a video-library clip after.

### Access control / paywalling

- Signed, time-limited playback URLs (supported by all the managed platforms listed above) are the standard way to gate premium content without needing full DRM — adequate for a product at this stage; full DRM (Widevine/FairPlay) is a much bigger lift usually reserved for high-value licensed content, not something to reach for by default here.

### Mobile playback

- The RN app needs a video player component — `expo-video` (or `expo-av`, being phased out upstream) for VOD, plus whatever SDK/player the chosen live provider ships for React Native. This is new mobile dependency work not currently reflected in `package.json`.

### Compliance note

- Michelle's existing services include kids' yoga (per `docs/reference/WILD-R~1.MD`). Any video/live feature that could involve minors needs a look at consent and recording/retention rules (e.g., COPPA-adjacent considerations for US users) before instructors are allowed to publish or stream content involving kids' classes — flagging now so it isn't missed later, not a fully researched compliance position.

## Suggested slot in the general plan

Insert after the currently-planned Phase 5 (Media pipeline) and Phase 6 (Student follow/notify), since video library + blasts build directly on both:
- **Video library** — after Phase 5 (media pipeline patterns extend naturally: upload, compress/transcode, store, serve).
- **Marketing blasts** — after Phase 6 (reuses the follow/notify pipeline), bundled into Phase 7 (Monetization) as a paid-tier gate.
- **Video series** — right after video library; cheap, mostly a grouping UI.
- **Live streaming** — last, deliberately, pending the watch-only-vs-interactive answer and after payments (Phase 7) already exist to gate it as a paid instructor feature.

The general plan doc's phase list has been updated with these as a new Phase 5a/6a-style insertion — see that doc for the current numbered order.

## Open questions

- Does "join live" mean watch-only broadcast, or does the instructor need to see/interact with participants? (Blocks the entire live-streaming cost/vendor decision.)
- Is live streaming genuinely app-only, or should a watch-only broadcast also be embeddable on the public web page like a VOD clip? (Soft lean toward app-only for v1, not decided.)
- Which VOD/live vendor, and what does it cost at realistic volume (needs a real pricing model, not this doc's placeholder vendor list)?
- How much of the "series" concept needs progress tracking before it's credible against competitors like Alo Moves/Glo/Peloton Digital — needs the market research already flagged as open in the general plan, specifically extended to video/course competitors.
- Blast frequency caps, to avoid follower fatigue even from paying instructors (carried from Epic 9).
- Minors/compliance handling for any video or live content tied to kids' classes.

# STELLAR SWARM — Music Integration Guide (for Claude Code)

## What We Have

The game already has a working SFX system (AudioManager + SynthEngine using Web Audio API). This guide covers adding **music** — specifically, MIDI-based melodies played through the same Web Audio API synthesizer.

### Proven Approach

We tested multiple approaches and landed on this:
1. **Suno AI** generates the music (MP3)
2. **Suno exports MIDI** directly (no Basic Pitch needed)
3. **MIDI parsed into JS arrays** — note data per voice: `[midiNote, durationBeats, startBeat, velocity]`
4. **Web Audio API synthesizer** plays the notes in real-time using sine oscillators
5. **Total weight**: ~30-80 KB per song (just data arrays, no audio files)

### First Song: "Silent Orbits" (Menu Theme)

MIDI file: `Silent Orbits.mid` — 82.52 BPM, 3 tracks, ~5 min.

**Important**: Suno MIDI exports have arbitrary instrument names (Orchestral Harp, Koto, SynthStrings, etc.) that vary per song. The synthesizer must NOT depend on these names. Instead, it auto-detects the envelope type from note characteristics (see Step 3).

---

## Integration Plan — Single Milestone

### Goal
Menu music playing "Silent Orbits" via MIDI data + Web Audio API sine synth, with volume control and loop.

### Step 1: Parse MIDI → JS Data

Use this Python script to extract note arrays from any Suno MIDI file:

```python
import mido
import mido.midifiles.meta as meta
import json, statistics

# Patch for Suno's invalid key signatures
_orig_decode = meta.MetaSpec_key_signature.decode
def _safe_decode(self, message, data):
    try:
        _orig_decode(self, message, data)
    except meta.KeySignatureError:
        message.key = 'C'
meta.MetaSpec_key_signature.decode = _safe_decode

mid = mido.MidiFile("Silent Orbits.mid")  # replace with any MIDI file
bpm = round(mido.tempo2bpm(next(
    msg.tempo for track in mid.tracks for msg in track if msg.type == 'set_tempo'
)), 2)
beat_dur = 60 / bpm

voice_idx = 0
voices_js = []

for i, track in enumerate(mid.tracks):
    notes = []
    abs_time, active = 0, {}
    for msg in track:
        abs_time += msg.time
        if msg.type == 'note_on' and msg.velocity > 0:
            active[msg.note] = (abs_time, msg.velocity)
        elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
            if msg.note in active:
                st, vel = active.pop(msg.note)
                sb = st / mid.ticks_per_beat
                db = (abs_time - st) / mid.ticks_per_beat
                if db > 0.01:
                    notes.append([int(msg.note), round(db, 4), round(sb, 4), int(vel)])
    if not notes:
        continue
    notes.sort(key=lambda n: n[2])

    # --- Auto-analyze voice characteristics ---
    durations_sec = [n[1] * beat_dur for n in notes]
    pitches = [n[0] for n in notes]
    median_dur = statistics.median(durations_sec)
    min_pitch = min(pitches)
    max_pitch = max(pitches)

    # Classify envelope type from median note duration
    if median_dur < 0.4:
        env_type = 'plucked'    # arpeggios, staccato, percussion-like
    elif median_dur > 1.2:
        env_type = 'pad'        # chords, pads, drones, sustained
    else:
        env_type = 'balanced'   # melodies, leads

    # Sub-octave needed for bass warmth?
    sub_octave = min_pitch < 50

    print(f"v{voice_idx}: '{track.name}' — {len(notes)} notes, "
          f"median_dur={median_dur:.2f}s → {env_type}, "
          f"range={min_pitch}-{max_pitch}, sub={sub_octave}")

    # Format notes as JS array
    notes_js = ','.join(
        f'[{n[0]},{round(n[1],3)},{round(n[2],3)},{round(n[3]/127,2)}]'
        for n in notes
    )
    voices_js.append(
        f'v{voice_idx}:{{type:"{env_type}",sub:{str(sub_octave).lower()},'
        f'notes:[{notes_js}]}}'
    )
    voice_idx += 1

# Output complete MUSIC_DATA entry
print(f"\n// Paste into MUSIC_DATA:")
print(f"song_name: {{bpm:{bpm},voices:{{{','.join(voices_js)}}}}}")
```

The parser auto-analyzes each track and outputs the voice `type` and `sub` fields. No manual configuration needed — just run it on any Suno MIDI and paste the output.

### Step 2: Add Music Data to index.html

Add a `MUSIC_DATA` constant near other game constants. Each voice has a pre-calculated `type` and `sub` from the parser — the synth just reads them:

```javascript
const MUSIC_DATA = {
    menu: {
        bpm: 82.52,
        voices: {
            v0: { type: 'plucked', sub: true,  notes: [ /* ... */ ] },
            v1: { type: 'pad',     sub: false, notes: [ /* ... */ ] },
            v2: { type: 'plucked', sub: true,  notes: [ /* ... */ ] }
        }
    }
    // Future: calm, tense, intense, gameOver
};
```

- **`type`**: `'plucked'` | `'balanced'` | `'pad'` — determines envelope shape
- **`sub`**: `true` | `false` — whether to add sub-octave on low notes

Both are auto-calculated by the parser from the MIDI data. No manual tuning needed.

### Step 3: MusicEngine Implementation

```javascript
const MusicEngine = {
    ctx: null,          // AudioContext (same as AudioManager's)
    masterGain: null,   // music master gain node
    playing: false,
    currentSong: null,
    scheduled: [],      // active oscillator refs for cleanup
    voiceIndex: {},     // playback position per voice
    startTime: 0,
    schedTimer: null,
    volume: 0.55,       // music master volume (user adjustable)

    init(audioCtx, destinationNode) {
        this.ctx = audioCtx;
        this.masterGain = audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(destinationNode);
    },

    play(songId) {
        if (this.playing) this.stop();
        const song = MUSIC_DATA[songId];
        if (!song) return;
        this.currentSong = song;
        this.playing = true;
        this.startTime = this.ctx.currentTime;
        for (const voice of Object.keys(song.voices)) {
            this.voiceIndex[voice] = 0;
        }
        this.schedTimer = setInterval(() => this._schedule(), 80);
        this._schedule();
    },

    stop() {
        this.playing = false;
        if (this.schedTimer) clearInterval(this.schedTimer);
        this.scheduled.forEach(n => { try { n.stop(); } catch(e) {} });
        this.scheduled = [];
    },

    _schedule() {
        if (!this.playing) return;
        const now = this.ctx.currentTime;
        const elapsed = now - this.startTime;
        const song = this.currentSong;
        const beatDur = 60 / song.bpm;
        const lookAhead = 0.5;

        for (const [voiceName, voiceData] of Object.entries(song.voices)) {
            const notes = voiceData.notes;
            let idx = this.voiceIndex[voiceName];
            while (idx < notes.length) {
                const [midi, dur, startBeat, vel] = notes[idx];
                const noteTime = startBeat * beatDur;
                if (noteTime > elapsed + lookAhead) break;
                if (noteTime >= elapsed - 0.01) {
                    this._playNote(midi, dur, vel, voiceData, this.startTime + noteTime);
                }
                idx++;
            }
            this.voiceIndex[voiceName] = idx;

            // Loop: when all notes played, restart
            if (idx >= notes.length) {
                const totalBeats = Math.max(...notes.map(n => n[2] + n[1]));
                if (elapsed >= totalBeats * beatDur - 0.5) {
                    this.startTime = now;
                    this.voiceIndex[voiceName] = 0;
                }
            }
        }

        // Memory cleanup: discard refs to stopped oscillators
        if (this.scheduled.length > 200) this.scheduled = [];
    },

    // GENERIC note synthesizer — reads voice.type and voice.sub from pre-analyzed data
    // No dependency on instrument names. Works with any MIDI export.
    _playNote(midi, durBeats, vel, voice, when) {
        const ac = this.ctx;
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        const v = vel * this.volume;
        const ds = durBeats * (60 / this.currentSong.bpm); // duration in seconds
        const t = when;
        const type = voice.type; // 'plucked', 'balanced', or 'pad' (pre-calculated by parser)

        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = freq;

        if (type === 'plucked') {
            // Fast attack, exponential decay (arpeggios, staccato, plucked instruments)
            o.connect(g); g.connect(this.masterGain);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(v * 0.45, t + 0.008);
            g.gain.exponentialRampToValueAtTime(v * 0.12, t + Math.max(0.02, ds * 0.4));
            g.gain.exponentialRampToValueAtTime(0.001, t + ds);

        } else if (type === 'pad') {
            // Slow attack, sustained, gentle release (chords, pads, drones)
            // Detuned second oscillator for richness
            const o2 = ac.createOscillator(), g2 = ac.createGain();
            o2.type = 'sine'; o2.frequency.value = freq * 1.003;
            o2.connect(g2); g2.connect(this.masterGain);
            const att = Math.min(0.3, ds * 0.2);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(v * 0.3, t + att);
            g.gain.setValueAtTime(v * 0.25, t + ds * 0.7);
            g.gain.linearRampToValueAtTime(0, t + ds);
            g2.gain.setValueAtTime(0, t);
            g2.gain.linearRampToValueAtTime(v * 0.12, t + att);
            g2.gain.linearRampToValueAtTime(0, t + ds);
            o.connect(g); g.connect(this.masterGain);
            o2.start(t); o2.stop(t + ds + 0.05);
            this.scheduled.push(o2);

        } else {
            // BALANCED — moderate attack, smooth decay (melodies, leads)
            o.connect(g); g.connect(this.masterGain);
            const att = Math.min(0.05, ds * 0.1);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(v * 0.38, t + att);
            g.gain.setValueAtTime(v * 0.3, t + ds * 0.6);
            g.gain.linearRampToValueAtTime(0, t + ds);
        }

        // Sub-octave warmth (pre-calculated: voice.sub = true when track has low notes)
        if (voice.sub && midi < 50 && ds >= 0.15) {
            const sub = ac.createOscillator(), sg = ac.createGain();
            sub.type = 'sine'; sub.frequency.value = freq * 0.5;
            sub.connect(sg); sg.connect(this.masterGain);
            sg.gain.setValueAtTime(v * 0.15, t);
            sg.gain.exponentialRampToValueAtTime(0.001, t + ds);
            sub.start(t); sub.stop(t + ds + 0.02);
            this.scheduled.push(sub);
        }

        o.start(t); o.stop(t + ds + 0.05);
        this.scheduled.push(o);
    },

    setVolume(v) {
        this.volume = v;
        if (this.masterGain) this.masterGain.gain.value = v;
    }
};
```

**How it works**: The Python parser analyzes each MIDI track's note data (median duration, pitch range) and pre-calculates `type` and `sub` for each voice. The synthesizer just reads these fields — no per-note heuristics at runtime. This is fully automatic: run the parser on any Suno MIDI, paste the output into `MUSIC_DATA`, done.

### Step 4: Integration Points

In the game's existing code, add these calls:

```javascript
// In AudioManager.init() or wherever AudioContext is created:
MusicEngine.init(audioCtx, masterGain); // or connect to a separate music bus

// In drawMainMenu() or wherever menu state starts:
if (!MusicEngine.playing) MusicEngine.play('menu');

// In startGame() or resetGame():
MusicEngine.stop(); // stop menu music when game starts
// Future: MusicEngine.play('calm');

// In gameOver():
MusicEngine.stop();
// Future: MusicEngine.play('gameOver');

// In pause menu or settings — music volume slider:
MusicEngine.setVolume(sliderValue);
```

### Step 5: Memory Management

The `scheduled[]` array will grow over time. Add cleanup of stopped oscillators:

```javascript
// In _schedule(), periodically clean up:
if (this.scheduled.length > 200) {
    this.scheduled = this.scheduled.filter(n => {
        try { n.stop(); return false; } catch(e) { return false; }
    });
}
```

Or better: oscillators auto-disconnect after `stop()` — just reset the array periodically.

---

## Synthesis — Pre-Analyzed Envelopes (Tested & Approved)

**All sine waves** — modern ambient electronic, not retro/chiptune. Voice `type` is pre-calculated by the parser from the track's median note duration:

| voice.type | Median dur threshold | Attack | Decay | Details |
|-----------|---------------------|--------|-------|---------|
| `plucked` | median < 0.4s | 8ms | exponential to 40% dur | Arpeggios, staccato, plucked instruments |
| `balanced` | 0.4s ≤ median ≤ 1.2s | 50ms | sustain at 60%, smooth release | Melodies, leads |
| `pad` | median > 1.2s | 200-300ms | sustain at 70%, gentle release | Chords, pads, drones (adds detuned 2nd osc) |

**`voice.sub`**: Set to `true` by the parser when track's lowest note is MIDI < 50. Adds sub-octave (freq × 0.5) on low notes for bass warmth.

---

## Future Songs

Same pipeline for each additional song:
1. Generate in Suno with appropriate mood prompt
2. Download MIDI
3. Parse with the Python script above
4. Add to `MUSIC_DATA` under the appropriate key (`calm`, `tense`, `intense`, `gameOver`)
5. Wire up the tension system to switch between songs

### Suno Prompts (Ready to Use)

- **Calm gameplay** (110 BPM): "ambient electronic space, floating pads, gentle arpeggios, sine wave, minimal percussion, calm exploration, 110 BPM, 2 minutes"
- **Tense gameplay** (125 BPM): "dark ambient electronic, pulsing bass, tense atmosphere, rising tension, space combat, 125 BPM, 2 minutes"
- **Intense gameplay** (140 BPM): "intense electronic space battle, driving rhythm, urgent melody, dramatic, 140 BPM, 2 minutes"
- **Game Over** (70 BPM): "melancholic ambient electronic, slow, reflective, fading, space void, 70 BPM, 1 minute"

---

## Key Decisions

- **No audio files** — everything is MIDI data + Web Audio API synthesis (~30-80 KB per song vs ~600KB+ for compressed audio)
- **Sine waves only** — modern, minimalist, matches the game's neon aesthetic without being retro
- **Generic multi-voice** — each MIDI track becomes a voice automatically, any number of tracks supported
- **Pre-analyzed envelopes** — parser calculates `type` (plucked/balanced/pad) and `sub` from MIDI data; synth just reads them
- **Works with any Suno MIDI** — the parser + synth adapt to whatever tracks/instruments Suno exports
- **Loop built-in** — sequencer restarts automatically at end of song
- **Same AudioContext** — shares the existing one from AudioManager/SynthEngine

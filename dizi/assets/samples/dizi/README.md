# Dizi one-shot samples

Dizi (Chinese bamboo flute) one-shot sample files, used with calibrated playback-rate transposition.

- Source: Freesound pack “Flute Dizi C all notes + pitched semitones” by Hypnotriod  
  https://freesound.org/people/Hypnotriod/packs/21613/
- Files here are the 128 kbps preview MP3s from `cdn.freesound.org`.
- License: CC0 1.0 (public domain).
- Freesound filenames say F6–G7, but their numeric prefix is the real MIDI note: 77–91 (F5–G6). The manifest uses the MIDI prefix, not the suffix octave.
- The bank includes all 25 notes in this pack: MIDI 67–91 (G4–G6), plus 7
  membrane-on recordings from the SUTD dataset (CC BY 4.0):
  https://doi.org/10.5281/zenodo.6333932 . See `SOURCES.txt` for attribution.
- Each recording has a measured sustained fundamental, onset, level and SHA-256 in
  `tuning.json`. The player uses `targetHz / measuredHz`, referenced to A4 = 440 Hz,
  rather than assuming the nominal MIDI label is perfectly tuned. Recorded medians
  were roughly +0.6 to +21.5 cents sharp before this correction.
- Reproduce measurements with `/usr/bin/python3 scripts/analyze-dizi.py --write`
  (requires ffmpeg and NumPy). Then run `node scripts/hash-assets.mjs`.
- Run `/usr/bin/python3 scripts/verify-dizi.py` for independent YIN/FFT checking
  of the rendered sustain and loop, and `node scripts/check-audio.mjs` for
  source fingerprints, absolute register anchors, all fingering/key combinations,
  and original/practice keys for all 26 scores.
- Concerto excerpts and room-heavy performance slices were removed to reduce ambience.
- The earlier G3–F♯4 "low register" was caused by an incorrect sounding octave.
  Ordinary C qudi starts at G4, and D qudi at A4, per Charlie Lui's range chart:
  https://www.soundofdragon.com/wp-content/uploads/2015/10/Charlie-dizi-range.pdf .
  Their middle tonic notes are C5 and D5. These low notes now use their own samples
  near playback rate 1.0, with only measured fine tuning.
- The covered teaching range is G4–E7 (MIDI 67–100). G♯6 and D♯7 use a nearest
  semitone recording; every other pitch has a matching MIDI sample. The player
  rejects larger transpositions. This bank does not claim to cover bass dadi.
- Long notes loop a crossfaded sustain region; no synthetic oscillator is substituted
  during loading or after a loading failure. Natural within-note pitch movement remains.

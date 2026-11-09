#!/usr/bin/env python3
"""apply_dtw.py — build vo/<id>.wav + vo/words.json from vo/dtw_words.json (DTW against the generated-voice reference),
snapping each line's edges to the nearest pause in the recording.  usage: python3 apply_dtw.py <recording.wav>"""
import sys, json, re, subprocess, wave, numpy as np
SR = 48000; REC = sys.argv[1]
script = json.load(open('script.json', encoding='utf-8')); dtw = json.load(open('vo/dtw_words.json'))
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', REC, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
win = SR // 100; n = len(x) // win
db = 20 * np.log10(np.sqrt(np.mean(x[:n * win].reshape(n, win) ** 2, 1)) + 1e-9); thr = db.max() - 40
quiet = db < thr
def snap(t, direction):            # start: nearest quiet→loud edge (forward first); end: nearest loud→quiet edge (backward first)
    i = int(t * 100)
    order = [d for d in range(0, 40)] + [-d for d in range(1, 40)]
    if direction == 'e': order = [-d for d in range(0, 40)] + [d for d in range(1, 40)]
    for d in order:
        j = i + d
        if 1 <= j < n - 1:
            if direction == 's' and quiet[j - 1] and not quiet[j]: return j / 100
            if direction == 'e' and not quiet[j] and quiet[j + 1]: return (j + 1) / 100
    return i / 100
out = []
for L in script:
    T = dtw[L['id']]; words = [w for w in L['text'].split() if re.sub(r'\W', '', w)]
    s, e = snap(T[0], 's'), snap(T[-1], 'e')
    a0, b0 = max(0, s - 0.05), min(len(x) / SR, e + 0.1)
    nxt = script.index(L) + 1
    if nxt < len(script): b0 = min(b0, snap(dtw[script[nxt]['id']][0], 's') - 0.03)
    seg = x[int(a0 * SR):int(b0 * SR)].copy(); f = int(.004 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    with wave.open(f"vo/{L['id']}.wav", 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(seg, -1, 1) * 32767).astype('<i2').tobytes())
    ts = [max(s, min(e, t)) for t in T[:len(words)]]; ts[0] = s
    ws = [{'w': w, 's': round(ts[i] - a0, 3), 'e': round((ts[i + 1] if i + 1 < len(ts) else e) - a0, 3)} for i, w in enumerate(words)]
    out.append({'id': L['id'], 'text': L['text'], 'file': f"vo/{L['id']}.wav", 'dur': round(b0 - a0, 3), 'words': ws,
                'gap_after': L.get('gap_after', .2), 'source': 'own-dtw', 'orig_start': round(a0, 3)})
    print(f"{L['id']:4} {s:6.2f}-{e:6.2f}")
json.dump({'voice': 'own', 'source': REC, 'lines': out}, open('vo/words.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

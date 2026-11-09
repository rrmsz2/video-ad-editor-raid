#!/usr/bin/env python3
"""align_own.py — fit a person's recording onto script.json lines without speech recognition.

Splits the recording at its pauses, picks the 13 pauses that best separate the
14 script lines (dynamic programming against expected line lengths from the
generated-voice reference), then spreads word times inside each line by
character count, snapping to the pauses inside the line.
Writes vo/<id>.wav + vo/words.json in the format voice.py produces.
usage: python3 align_own.py <proj> <recording.wav>
"""
import sys, os, json, re, subprocess, wave
import numpy as np
SR = 48000
P, REC = sys.argv[1], sys.argv[2]
script = json.load(open(os.path.join(P, 'script.json'), encoding='utf-8'))
ref = {L['id']: L for L in json.load(open(os.path.join(P, 'vo/words.json'), encoding='utf-8'))['lines']}

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', REC, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).copy()
win = int(0.01 * SR); n = len(x) // win
db = 20 * np.log10(np.sqrt(np.mean(x[:n * win].reshape(n, win) ** 2, 1)) + 1e-9)
thr = max(np.percentile(db, 20) + 8, db.max() - 45)
speech = db > thr
# pauses >= 0.2s
pauses, i = [], 0
while i < n:
    if not speech[i]:
        j = i
        while j < n and not speech[j]: j += 1
        if (j - i) >= 20 and i > 0 and j < n: pauses.append((i / 100, j / 100))
        i = j
    else: i += 1
on = np.where(speech)[0]; t0, t1 = on[0] / 100, (on[-1] + 1) / 100
print(f'speech {t0:.2f}-{t1:.2f}s, {len(pauses)} pauses')

ids = [L['id'] for L in script]; N = len(ids)
exp = np.array([ref[i]['dur'] for i in ids]); exp = exp / exp.sum()
total = t1 - t0
cand = pauses  # choose N-1 of these as line breaks
M = len(cand)
INF = 1e18
# dp[k][j] = best cost with k breaks, last break = cand j
def seg_cost(a, b, li):
    d = (b - a) / total
    return (np.log(max(d, 1e-3) / exp[li])) ** 2
best = [[INF] * M for _ in range(N)]; back = [[-1] * M for _ in range(N)]
for j in range(M):
    best[1][j] = seg_cost(t0, cand[j][0], 0) - 0.15 * (cand[j][1] - cand[j][0])
for k in range(2, N):
    for j in range(M):
        for p in range(j):
            if best[k - 1][p] >= INF: continue
            c = best[k - 1][p] + seg_cost(cand[p][1], cand[j][0], k - 1) - 0.15 * (cand[j][1] - cand[j][0])
            if c < best[k][j]: best[k][j] = c; back[k][j] = p
fin = min(range(M), key=lambda j: best[N - 1][j] + seg_cost(cand[j][1], t1, N - 1) if best[N - 1][j] < INF else INF)
brk = [fin]
for k in range(N - 1, 1, -1): brk.append(back[k][brk[-1]])
brk = brk[::-1]
spans = []; a = t0
for k, j in enumerate(brk): spans.append((a, cand[j][0])); a = cand[j][1]
spans.append((a, t1))

def norm_len(w): return max(1, len(re.sub(r'[ً-ْـ\W]', '', w)))
os.makedirs(os.path.join(P, 'vo'), exist_ok=True)
out = []
for L, (a, b) in zip(script, spans):
    a0, b0 = max(0, a - 0.04), b + 0.08
    seg = x[int(a0 * SR):int(b0 * SR)].copy(); f = int(0.004 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    fn = os.path.join(P, 'vo', L['id'] + '.wav')
    with wave.open(fn, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(seg, -1, 1) * 32767).astype('<i2').tobytes())
    words = [w for w in L['text'].split() if re.sub(r'\W', '', w)]
    # speech-only timeline inside line (skip inner pauses)
    inner = [(p0 - a0, p1 - a0) for p0, p1 in pauses if p0 > a and p1 < b]
    dur = b0 - a0
    pieces = []; s = a - a0
    for p0, p1 in inner: pieces.append((s, p0)); s = p1
    pieces.append((s, b - a0))
    tot = sum(e - s for s, e in pieces); lens = [norm_len(w) for w in words]; ctot = sum(lens)
    def at(frac):
        r = frac * tot
        for s, e in pieces:
            if r <= e - s: return s + r
            r -= e - s
        return pieces[-1][1]
    acc = 0; ws = []
    for w, l in zip(words, lens):
        ws.append({'w': w, 's': round(at(acc / ctot), 3), 'e': round(at((acc + l) / ctot), 3)}); acc += l
    out.append({'id': L['id'], 'text': L['text'], 'file': 'vo/' + L['id'] + '.wav', 'dur': round(dur, 3), 'words': ws,
                'gap_after': L.get('gap_after', 0.2), 'source': 'own', 'orig_start': round(a0, 3)})
    print(f"  {L['id']:4} {a:6.2f}-{b:6.2f}  ({b-a:4.2f}s, ref {exp[ids.index(L['id'])]*total:4.2f}s)  {L['text'][:40]}")
json.dump({'voice': 'own', 'source': os.path.basename(REC), 'lines': out}, open(os.path.join(P, 'vo/words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('✅ vo/words.json')

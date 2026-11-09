import json, numpy as np, librosa, sys
sr = 16000; hop = 160
a, _ = librosa.load('vo/tts_full.wav', sr=sr); b, _ = librosa.load('vo_own.wav', sr=sr)
def feat(y):
    m = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20, hop_length=hop, n_fft=512)[1:]
    return (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
A, B = feat(a), feat(b)
D, wp = librosa.sequence.dtw(X=A, Y=B, metric='cosine', subseq=False)
wp = wp[::-1]
ta = wp[:, 0] * hop / sr; tb = wp[:, 1] * hop / sr
def map_t(t): return float(np.interp(t, ta, tb))
tl = json.load(open('timeline.tts.json'))
res = {}
for v in tl['vo']:
    res[v['id']] = [map_t(w['s']) for w in v['words']] + [map_t(v['end'])]
    print(v['id'], f"{map_t(v['start']):6.2f} - {map_t(v['end']):6.2f}")
json.dump(res, open('vo/dtw_words.json', 'w'))

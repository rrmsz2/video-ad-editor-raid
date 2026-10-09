# Full-hadith single take (v4) -> data.json for engine/compose.html
# usage: python3 build_full.py <work>   (expects <work>/a.wav 16 kHz mono, <work>/p1/%05d.jpg frames)
import json, re, sys, wave, numpy as np
WORK = sys.argv[1]; FPS = 30
SRC_FRAMES = 2946
IN, OUT = 1.15, 97.30            # trim: empty head; cut before he walks to the camera (~97.5)
HOLD = 2.6                       # outro hold (blurred ping-pong of the last calm frames)

# Speech chunks (silence-split, Whisper large-v3) with the text AS SPOKEN, corrected against Sahih Muslim 8.
# Spoken variants kept: «وتعطي» (riwaya: وتؤتي), «هل تدري» (riwaya: أتدري).
CH = [(1.480, 3.657, 'عن عمر بن الخطاب رضي الله عنه قال'),
      (3.977, 8.362, 'بينما نحن جلوس عند رسول الله صلى الله عليه وسلم ذات يوم'),
      (8.873, 9.124, 'إذ'), (9.310, 10.658, 'طلع علينا رجل'),
      (11.139, 12.263, 'شديد بياض الثياب'), (12.770, 13.935, 'شديد سواد الشعر'),
      (14.591, 16.267, 'لا يُرى عليه أثر السفر'), (16.589, 17.934, 'ولا يعرفه منا أحد'),
      (18.551, 21.314, 'حتى جلس إلى النبي صلى الله عليه وسلم'),
      (21.875, 24.302, 'فأسند ركبتيه إلى ركبتيه'),
      (24.919, 28.133, 'ووضع كفيه على فخذيه وقال يا محمد'),
      (28.595, 29.771, 'أخبرني عن الإسلام'),
      (30.977, 33.533, 'فقال رسول الله صلى الله عليه وسلم'),
      (34.152, 36.805, 'الإسلام أن تشهد أن لا إله إلا الله'),
      (37.134, 38.846, 'وأن محمدًا رسول الله'),
      (39.255, 41.369, 'وتقيم الصلاة وتعطي الزكاة'), (41.529, 42.571, 'وتصوم رمضان'),
      (43.027, 45.256, 'وتحج البيت إن استطعت إليه سبيلا'),
      (45.982, 46.686, 'قال صدقت'), (47.032, 49.111, 'فعجبنا له يسأله ويصدقه'),
      (49.647, 51.278, 'قال فأخبرني عن الإيمان'), (51.447, 51.746, 'قال'),
      (52.248, 57.099, 'أن تؤمن بالله وملائكته وكتبه ورسله واليوم الآخر'),
      (57.303, 59.232, 'وتؤمن بالقدر خيره وشره'),
      (59.888, 60.494, 'قال صدقت'),
      (61.318, 63.388, 'قال فأخبرني عن الإحسان قال'),
      (63.874, 65.823, 'أن تعبد الله كأنك تراه'), (66.097, 68.266, 'فإن لم تكن تراه فإنه يراك'),
      (69.386, 70.869, 'قال فأخبرني عن الساعة'),
      (71.462, 72.990, 'قال ما المسؤول عنها'), (73.330, 74.644, 'بأعلم من السائل'),
      (75.095, 77.168, 'قال فأخبرني عن أماراتها'),
      (77.696, 79.727, 'قال أن تلد الأمة ربتها'),
      (80.061, 83.013, 'وأن ترى الحفاة العراة العالة رعاء الشاء'),
      (83.504, 84.825, 'يتطاولون في البنيان'),
      (85.224, 85.913, 'ثم انطلق'), (86.245, 87.109, 'فلبثت مليًّا'),
      (87.766, 88.766, 'ثم قال يا عمر'), (89.015, 90.030, 'هل تدري من السائل'),
      (90.594, 92.550, 'قلت الله ورسوله أعلم'),
      (92.855, 96.039, 'قال فإنه جبريل أتاكم يعلمكم دينكم'),
      (96.300, 97.062, 'رواه مسلم')]

# caption lines: 3-5 words, fixed phrases never split
LINES = ['عن عمر بن الخطاب', 'رضي الله عنه قال', 'بينما نحن جلوس', 'عند رسول الله', 'صلى الله عليه وسلم', 'ذات يوم',
         'إذ طلع علينا رجل', 'شديد بياض الثياب', 'شديد سواد الشعر', 'لا يُرى عليه أثر السفر', 'ولا يعرفه منا أحد',
         'حتى جلس إلى النبي', 'صلى الله عليه وسلم', 'فأسند ركبتيه إلى ركبتيه', 'ووضع كفيه على فخذيه', 'وقال يا محمد',
         'أخبرني عن الإسلام', 'فقال رسول الله', 'صلى الله عليه وسلم', 'الإسلام أن تشهد', 'أن لا إله إلا الله',
         'وأن محمدًا رسول الله', 'وتقيم الصلاة وتعطي الزكاة', 'وتصوم رمضان وتحج البيت', 'إن استطعت إليه سبيلا',
         'قال صدقت', 'فعجبنا له يسأله ويصدقه', 'قال فأخبرني عن الإيمان', 'قال أن تؤمن', 'بالله وملائكته وكتبه',
         'ورسله واليوم الآخر', 'وتؤمن بالقدر خيره وشره', 'قال صدقت', 'قال فأخبرني عن الإحسان', 'قال أن تعبد',
         'الله كأنك تراه', 'فإن لم تكن', 'تراه فإنه يراك', 'قال فأخبرني عن الساعة', 'قال ما المسؤول عنها',
         'بأعلم من السائل', 'قال فأخبرني عن أماراتها', 'قال أن تلد الأمة ربتها', 'وأن ترى الحفاة العراة',
         'العالة رعاء الشاء', 'يتطاولون في البنيان', 'ثم انطلق فلبثت مليًّا', 'ثم قال يا عمر', 'هل تدري من السائل',
         'قلت الله ورسوله أعلم', 'قال فإنه جبريل', 'أتاكم يعلمكم دينكم', 'رواه مسلم']
HOT = {'الإسلام', 'جبريل', 'الصلاة', 'الزكاة', 'رمضان', 'البيت', 'يعلمكم', 'دينكم', 'مسلم'}

plain = lambda w: re.sub(r'[ً-ْٰـ]', '', w)
hot = lambda w: plain(w) in HOT or plain(w).lstrip('و') in HOT

w = wave.open(f'{WORK}/a.wav'); A = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
HOP = 160; E = np.sqrt(np.convolve(A ** 2, np.ones(480) / 480, 'same')[::HOP] + 1e-9)   # 10 ms RMS
def snap(t, r=.09):      # move a word boundary to the nearest energy dip
    a, b = int((t - r) * 100), int((t + r) * 100); seg = E[a:b]
    return (a + int(np.argmin(seg))) / 100 if len(seg) else t

words = []
for s, e, txt in CH:
    ws = txt.split(); L = [len(plain(x)) + 1.5 for x in ws]; tot = sum(L); t = s; bnd = [s]
    for l in L[:-1]: t += (e - s) * l / tot; bnd.append(snap(t))
    bnd.append(e)
    for i, x in enumerate(ws):
        words.append({'w': x, 's': round(bnd[i] - IN, 3), 'e': round(bnd[i + 1] - IN, 3), 'hot': hot(x)})
flat = [x for l in LINES for x in l.split()]
assert flat == [x['w'] for x in words], 'LINES do not match CH'
lines = []; k = 0
for l in LINES:
    n = len(l.split()); lines.append({'s': words[k]['s'], 'e': words[k + n - 1]['e'], 'words': list(range(k, k + n))}); k += n
for a, b in zip(lines, lines[1:]): a['e'] = round(min(b['s'] - .02, a['e'] + .7), 3)
lines[-1]['e'] = round(lines[-1]['e'] + .5, 3)

DUR = OUT - IN; TOT = DUR + HOLD
frames = []
n0 = int(round(IN * FPS)); nOut = int(round(OUT * FPS))
for n in range(int(round(DUR * FPS))): frames.append({'g': 0, 'c': 1, 'k': min(n0 + n, SRC_FRAMES - 1) + 1})
pp = list(range(nOut - 22, nOut)); pp = pp + pp[::-1]          # 0.73 s back and forth, blurred under the outro
for n in range(int(round(HOLD * FPS))): frames.append({'g': 1, 'c': 1, 'k': pp[n % len(pp)] + 1})

def W_(txt, occ=0): return [x for x in words if plain(x['w']) == plain(txt)][occ]
def first_after(txt, t): return next(x for x in words if plain(x['w']) == plain(txt) and x['s'] >= t)
ask_islam = W_('أخبرني'); shd = W_('تشهد')
ask_iman = first_after('فأخبرني', 45); iman0 = first_after('تؤمن', 50)
ask_ihsan = first_after('فأخبرني', 58); ihs0 = first_after('تعبد', 60)
ask_hour = first_after('فأخبرني', 66); bun = W_('البنيان')
S = {'hook': [0, 3.4], 'name': [3.8, 8.4],
     'levels': [{'k': 'islam', 's': ask_islam['s'] - .2, 'e': shd['s'] - .55},
                {'k': 'iman', 's': ask_iman['s'] - .2, 'e': iman0['s'] - .45},
                {'k': 'ihsan', 's': ask_ihsan['s'] - .2, 'e': ihs0['s'] - .45}],
     'sets': [{'title': 'أركان الإسلام', 's': shd['s'] - .3, 'e': W_('سبيلا')['e'] + .9,
               'items': [['الشهادتان', shd['s']], ['الصلاة', W_('الصلاة')['s']], ['الزكاة', W_('الزكاة')['s']],
                         ['الصوم', W_('وتصوم')['s']], ['الحج', W_('وتحج')['s']]]},
              {'title': 'أركان الإيمان', 's': iman0['s'] - .3, 'e': W_('وشره')['e'] + .9,
               'items': [['الله', W_('بالله')['s']], ['الملائكة', W_('وملائكته')['s']], ['الكتب', W_('وكتبه')['s']],
                         ['الرسل', W_('ورسله')['s']], ['اليوم الآخر', W_('واليوم')['s']],
                         ['القدر خيره وشره', W_('بالقدر')['s']]]}],
     'quote': {'s': ihs0['s'] - .3, 'e': W_('يراك')['e'] + 1.0,
               'text': 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ|فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ', 'split': first_after('فإن', 64)['s']},
     'hour': [ask_hour['s'] - .2, bun['e'] + .6],
     'summary': W_('أتاكم')['s'] - .15,
     'outro': [round(W_('مسلم')['e'] + .3, 3), TOT],
     'cuts': [], 'jump': -99}
D = {'dur': round(TOT, 3), 'words': words, 'lines': lines, 'frames': frames, 'scenes': S, 'style': 'plain',
     'fit': {'reel': [{'z': 1, 'ax': .5, 'ay': .5, 'cx': 540, 'cy': 960}, {'z': 1.04, 'blur': 1, 'ax': .5, 'ay': .5, 'cx': 540, 'cy': 960}],
             'yt': [{'z': 1, 's': .62, 'ax': .5, 'ay': .42, 'cy': 470}, {'z': 1.04, 'blur': 1, 's': .62, 'ax': .5, 'ay': .42, 'cy': 470}]}}
json.dump(D, open(f'{WORK}/data.json', 'w'), ensure_ascii=False)
print('dur', round(DUR, 2), 'total', round(TOT, 2), 'frames', len(frames), 'lines', len(lines))
print({k: v for k, v in S.items() if k not in ('sets',)})

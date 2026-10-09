import json, re, wave, numpy as np
FPS=30
# segments: (clip, src_start, src_end)
# text-only bridge for the part missing from the recordings (verbatim from Sahih Muslim 8 / Nawawi 2)
BLOCKS=[{'q':'فَأَخْبِرْنِي عَنِ الْإِيمَانِ','qd':2.3,'chips':['بِاللَّهِ','وَمَلَائِكَتِهِ','وَكُتُبِهِ','وَرُسُلِهِ','وَالْيَوْمِ الْآخِرِ','وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ'],'lead':'أَنْ تُؤْمِنَ','title':'أركان الإيمان','ad':7.4,'tag':'قَالَ: صَدَقْتَ','tagd':1.7,'lv':'iman'},
        {'q':'فَأَخْبِرْنِي عَنِ الْإِحْسَانِ','qd':2.3,'a':'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ','ad':6.0,'lv':'ihsan'},
        {'q':'فَأَخْبِرْنِي عَنِ السَّاعَةِ','qd':2.2,'a':'مَا الْمَسْؤُولُ عَنْهَا بِأَعْلَمَ مِنَ السَّائِلِ','ad':4.2,'hd':'الساعة وأماراتها'},
        {'q':'فَأَخْبِرْنِي عَنْ أَمَارَاتِهَا','qd':2.2,'a':'أَنْ تَلِدَ الْأَمَةُ رَبَّتَهَا، وَأَنْ تَرَى الْحُفَاةَ الْعُرَاةَ الْعَالَةَ رِعَاءَ الشَّاءِ يَتَطَاوَلُونَ فِي الْبُنْيَانِ','ad':8.0,'hd':'الساعة وأماراتها'},
        {'n':'ثُمَّ انْطَلَقَ','nd':2.0}]
TD=round(sum(b.get('qd',0)+b.get('ad',0)+b.get('tagd',0)+b.get('nd',0) for b in BLOCKS)+0.8,2)
SEG=[(2,1.25,24.62),(3,0.00,5.05),(3,5.80,24.35),('T',0,TD),(1,8.62,20.00)]
# corrected phrases per clip: (start,end,text)  — text from the recitation (Sahih Muslim, hadith Jibril)
PH={2:[(1.479,3.674,'عن عمر بن الخطاب | رضي الله عنه قال'),
       (3.971,8.386,'بينما نحن جلوس | عند رسول الله | صلى الله عليه وسلم | ذات يوم'),
       (8.872,10.682,'إذ طلع علينا رجل'),(11.139,12.264,'شديد بياض الثياب'),(12.767,13.942,'شديد سواد الشعر'),
       (14.589,16.266,'لا يُرى عليه أثر السفر'),(16.587,17.939,'ولا يعرفه منا أحد'),
       (18.55,21.321,'حتى جلس إلى النبي | صلى الله عليه وسلم'),(21.875,24.335,'فأسند ركبتيه إلى ركبتيه')],
    3:[(0.0,3.139,'ووضع كفيه على فخذيه | وقال يا محمد'),(3.597,4.777,'أخبرني عن الإسلام'),
       (5.979,8.536,'فقال رسول الله | صلى الله عليه وسلم'),(9.155,11.811,'الإسلام أن تشهد | أن لا إله إلا الله'),
       (12.136,13.848,'وأن محمدًا رسول الله'),(14.256,17.578,'وتقيم الصلاة | وتعطي الزكاة | وتصوم رمضان'),
       (18.03,20.274,'وتحج البيت | إن استطعت إليه سبيلا'),(20.985,21.704,'قال صدقت'),(22.034,24.113,'فعجبنا له يسأله ويصدقه')],
    1:[(8.823,9.693,'فلبثتُ مليًّا'),(10.344,12.614,'ثم قال يا عمر | هل تدري من السائل'),(13.171,15.142,'قلت الله ورسوله أعلم'),
       (15.431,18.619,'قال فإنه جبريل | أتاكم يعلمكم دينكم'),(18.878,19.648,'رواه مسلم')]}
HOT={'الإسلام','جبريل','دينكم','يعلمكم','الصلاة','الزكاة','رمضان','البيت','الله','محمد','يا','محمدًا'}
HOT={'الإسلام','جبريل','يعلمكم','دينكم','الصلاة','الزكاة','رمضان','البيت','مسلم'}
# split phrase into caption lines of <=4 words (balanced)
def lines_of(ws):
    n=len(ws); k=(n+3)//4; base=n//k; extra=n%k; out=[];i=0
    for j in range(k):
        m=base+(1 if j<extra else 0); out.append(ws[i:i+m]); i+=m
    return out
plain=lambda w: re.sub(r'[ً-ْـ]','',w)
# per-word envelope: refine word boundaries with audio energy inside the phrase
def load(i):
    w=wave.open(f'work/a{i}.wav'); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
AUD={i:load(i) for i in (1,2,3)}
def word_times(i,s,e,ws):
    L=[max(1,len(plain(w)))+1.2 for w in ws]; tot=sum(L); t=s; out=[]
    for w,l in zip(ws,L):
        d=(e-s)*l/tot; out.append([t,t+d]); t+=d
    return out
# map source time -> output time
outs=[];o=0.0
for c,a,b in SEG: outs.append((c,a,b,o)); o+=b-a
DUR=o
def map_t(c,t):
    for cc,a,b,o in outs:
        if cc==c and a-0.05<=t<=b+0.05: return o+min(max(t,a),b)-a
    return None
words=[];lines=[]
for c,a,b,o in outs:
    for s,e,txt in PH.get(c,[]):
        if s< a-0.1 or e> b+0.3: continue
        groups=[g.split() for g in txt.split('|')]; ws=[w for g in groups for w in g]; wt=word_times(c,s,e,ws)
        idx=[]
        for w,(ws_,we_) in zip(ws,wt):
            words.append({'w':w,'s':round(map_t(c,ws_),3),'e':round(map_t(c,min(we_,b)),3),'hot':plain(w) in {plain(h) for h in HOT}})
            idx.append(len(words)-1)
        k=0; chunks=[]
        for g in groups: chunks.append(idx[k:k+len(g)]); k+=len(g)
        for ln in [l for ch in chunks for l in (lines_of(ch) if len(ch)>5 else [ch])]:
            lines.append({'s':words[ln[0]]['s'],'e':words[ln[-1]]['e'],'words':ln})
# extend each line until next line (max +0.6s) so captions don't blink
for a,b in zip(lines,lines[1:]): a['e']=round(min(b['s']-0.02,a['e']+0.6),3)
lines[-1]['e']=round(lines[-1]['e']+0.6,3)
# frames: output frame n -> (clip, src frame); plus a 2.2 s ping-pong hold at the end for the outro
frames=[]
for g,(c,a,b,o) in enumerate(outs):
    n0=round(o*FPS); n1=round((o+b-a)*FPS)
    for n in range(n0,n1):
        if c=='T':
            j=(n-n0)%220; frames.append({'g':g,'c':3,'k':530+(j if j<110 else 219-j)})
        else: frames.append({'g':g,'c':c,'k':min(int(round(a*FPS))+(n-n0), {1:623,2:749,3:750}[c])})
HOLD=66; tail=frames[-HOLD:]
frames+= tail[::-1]
TOT=len(frames)/FPS
def wt(txt,occ=0):
    m=[w for w in words if plain(w['w'])==plain(txt)]; return m[occ]
cut1=outs[1][3]; cut2=outs[2][3]; cut3=outs[3][3]; cut4=outs[4][3]
t=cut3+0.4; tb=[]
for b in BLOCKS:
    e=dict(b); e['s']=round(t,3)
    if 'q' in b: e['as']=round(t+b['qd'],3); t+=b['qd']+b['ad']
    if 'tag' in b: e['ts']=round(t,3); t+=b['tagd']
    if 'n' in b: t+=b['nd']
    e['e']=round(t,3); tb.append(e)
ask=wt('أخبرني'); 
pil_s=wt('تشهد')['s']-0.3
pillars=[('الشهادتان',wt('تشهد')['s']),('الصلاة',wt('الصلاة')['s']),('الزكاة',wt('الزكاة')['s']),('الصوم',wt('رمضان')['s']-0.25),('الحج',wt('وتحج')['s'])]
D={'dur':round(TOT,3),'words':words,'lines':lines,'frames':frames,
   'scenes':{'hook':[0,3.4],'name':[3.6,8.2],
             'levels':[{'k':'islam','s':ask['s']-0.2,'e':pil_s-0.35}]+[{'k':b['lv'],'s':b['s'],'e':b['e']-0.2} for b in tb if 'lv' in b],
             'text':{'s':cut3,'e':cut4,'blocks':tb},
             'pillars':{'s':pil_s,'e':wt('سبيلا')['e']+0.8,'items':pillars},
             'jump':cut4,'cuts':[cut1,cut2,cut3],
             'summary':wt('أتاكم')['s']-0.1,
             'outro':[round(wt('مسلم')['e']+0.35,3),TOT]},
   'style':'plain',
   'fit':{'reel':[{'z':1,'ax':.46,'ay':.38,'cx':.46*1080,'cy':.38*1920},{'z':1,'ax':.44,'ay':.40,'cx':.44*1080,'cy':.40*1920},{'z':1.06,'ax':.44,'ay':.40,'cx':.44*1080,'cy':.40*1920},{'z':1.1,'blur':1,'ax':.44,'ay':.40,'cx':.44*1080,'cy':.40*1920},{'z':1,'ax':.47,'ay':.38,'cx':.47*1080,'cy':.38*1920}],
          'yt':[{'z':1,'s':.70,'ax':.46,'ay':.5,'cy':432},{'z':1,'s':.70,'ax':.435,'ay':.5,'cy':410},{'z':1.06,'s':.70,'ax':.435,'ay':.5,'cy':410},{'z':1.1,'blur':1,'s':.70,'ax':.435,'ay':.5,'cy':410},{'z':1,'s':.70,'ax':.47,'ay':.5,'cy':432}]}}
json.dump(D,open('work/data.json','w'),ensure_ascii=False)
json.dump(SEG,open('work/seg.json','w'))
print('TD',TD,'dur',DUR,'total',TOT,'frames',len(frames),'cuts',cut1,cut2,cut3)
for l in lines: print(round(l['s'],2),round(l['e'],2),' '.join(words[i]['w'] for i in l['words']))
print(D['scenes'])

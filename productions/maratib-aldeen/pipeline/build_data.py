import json, re, wave, numpy as np
FPS=30
# segments: (clip, src_start, src_end)
SEG=[(2,1.25,24.62),(3,0.00,5.05),(3,5.80,24.35),(1,8.62,20.00)]
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
    for s,e,txt in PH[c]:
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
    for n in range(n0,n1): frames.append({'g':g,'c':c,'k':min(int(round(a*FPS))+(n-n0), {1:623,2:749,3:750}[c])})
HOLD=66; tail=frames[-HOLD:]
frames+= tail[::-1]
TOT=len(frames)/FPS
def wt(txt,occ=0):
    m=[w for w in words if plain(w['w'])==plain(txt)]; return m[occ]
cut1=outs[1][3]; cut2=outs[2][3]; cut3=outs[3][3]
ask=wt('أخبرني'); 
pil_s=wt('تشهد')['s']-0.3
pillars=[('الشهادتان',wt('تشهد')['s']),('الصلاة',wt('الصلاة')['s']),('الزكاة',wt('الزكاة')['s']),('الصوم',wt('رمضان')['s']-0.25),('الحج',wt('وتحج')['s'])]
D={'dur':round(TOT,3),'words':words,'lines':lines,'frames':frames,
   'scenes':{'hook':[0,3.4],'name':[3.6,8.2],
             'levels':[{'k':'islam','s':ask['s']-0.2,'e':pil_s-0.35}],
             'pillars':{'s':pil_s,'e':wt('سبيلا')['e']+0.8,'items':pillars},
             'jump':cut3,'cuts':[cut1,cut2],
             'summary':wt('أتاكم')['s']-0.1,
             'outro':[round(wt('مسلم')['e']+0.35,3),TOT]},
   'fit':{'reel':[{'s':.949,'cx':579,'bottom':1920},{'s':.976,'cx':609,'bottom':1920},{'s':1.035,'cx':613,'bottom':1920},{'s':.938,'cx':573,'bottom':1920}],
          'yt':[{'s':.719,'cx':1430,'bottom':1080},{'s':.740,'cx':1452,'bottom':1080},{'s':.777,'cx':1455,'bottom':1080},{'s':.711,'cx':1425,'bottom':1080}]}}
json.dump(D,open('work/data.json','w'),ensure_ascii=False)
print('dur',DUR,'total',TOT,'frames',len(frames),'cuts',cut1,cut2,cut3)
for l in lines: print(round(l['s'],2),round(l['e'],2),' '.join(words[i]['w'] for i in l['words']))
print(D['scenes'])

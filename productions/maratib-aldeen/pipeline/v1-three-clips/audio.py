import numpy as np, subprocess, json
SR=48000
def load(i):
    b=subprocess.run(['ffmpeg','-v','error','-i',f'work/c{i}.mov','-vn','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(b,np.float32).reshape(-1,2)
A={i:load(i) for i in (1,2,3)}
SEG=json.load(open('work/seg.json'))
# room tone: quiet stretch before he starts speaking (clip 2), looped with crossfades
rt=A[2][int(.1*SR):int(1.3*SR)].copy(); xf=int(.25*SR)
D=json.load(open('work/data.json')); TOT=D['dur']
out=np.zeros((int(TOT*SR)+SR,2),np.float32); o=0.0
for j,(c,a,b) in enumerate(SEG):
    lead=0.0; tail=0.0 if j==len(SEG)-1 else 0.05
    if c=='T':
        n=int((b-a)*SR); seg=np.zeros((n,2),np.float32); p0=0; L=len(rt)
        while p0<n:
            piece=rt[:min(L,n-p0)].copy(); f=min(xf,len(piece)//2)
            piece[:f]*=np.linspace(0,1,f)[:,None]; piece[-f:]*=np.linspace(1,0,f)[:,None]
            seg[p0:p0+len(piece)]+=piece; p0+=L-xf
        seg*=0.8
    else:
        s=int((a-lead)*SR); e=int((b+tail)*SR); seg=A[c][max(0,s):e].copy()
    fi=int(.03*SR); fo=int((.4 if j==len(SEG)-1 else .05)*SR)
    seg[:fi]*=np.linspace(0,1,fi)[:,None]; seg[-fo:]*=np.linspace(1,0,fo)[:,None]
    p=int((o-lead)*SR); out[p:p+len(seg)]+=seg; o+=b-a
out=out[:int(TOT*SR)]
out.astype(np.float32).tofile('work/mix.f32')
print('len',len(out)/SR)

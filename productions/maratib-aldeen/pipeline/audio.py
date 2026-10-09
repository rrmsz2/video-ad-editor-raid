import numpy as np, subprocess, json
SR=48000
def load(i):
    b=subprocess.run(['ffmpeg','-v','error','-i',f'work/c{i}.mov','-vn','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(b,np.float32).reshape(-1,2)
A={i:load(i) for i in (1,2,3)}
SEG=[(2,1.25,24.62),(3,0.00,5.05),(3,5.80,24.35),(1,8.62,20.00)]
D=json.load(open('work/data.json')); TOT=D['dur']
out=np.zeros((int(TOT*SR)+SR,2),np.float32); o=0.0
for j,(c,a,b) in enumerate(SEG):
    lead=0.0; tail=0.0 if j==len(SEG)-1 else 0.05
    s=int((a-lead)*SR); e=int((b+tail)*SR); seg=A[c][max(0,s):e].copy()
    fi=int(.03*SR); fo=int((.4 if j==len(SEG)-1 else .05)*SR)
    seg[:fi]*=np.linspace(0,1,fi)[:,None]; seg[-fo:]*=np.linspace(1,0,fo)[:,None]
    p=int((o-lead)*SR); out[p:p+len(seg)]+=seg; o+=b-a
out=out[:int(TOT*SR)]
out.astype(np.float32).tofile('work/mix.f32')
print('len',len(out)/SR)

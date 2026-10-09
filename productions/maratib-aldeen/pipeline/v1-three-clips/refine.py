# refine u2net masks: plate gating (static camera) + temporal smoothing + guided filter
import cv2, numpy as np, os, sys
i=sys.argv[1]; W_,H_=1080,1920
fs=sorted(os.listdir(f'work/f{i}')); N=len(fs)
def raw(k):
    k=min(max(k,0),N-1); m=cv2.imread(f'work/m{i}/{k:05d}.png',0).astype(np.float32)/255
    return cv2.resize(m,(W_,H_),interpolation=cv2.INTER_CUBIC).clip(0,1)
def img(k): return cv2.imread(f'work/f{i}/{k:05d}.jpg').astype(np.float32)
# plate: median of background pixels over sampled frames
idx=np.linspace(0,N-1,36).astype(int)
stack=[];ms=[]
for k in idx:
    m=raw(k); m=cv2.dilate((m>.15).astype(np.uint8),np.ones((41,41),np.uint8))
    im=img(k); im[m>0]=np.nan; stack.append(im)
stack=np.array(stack,np.float32)
plate=np.nanmedian(stack,axis=0)          # NaN where never seen
known=~np.isnan(plate[...,0]); plate=np.nan_to_num(plate)
print('plate known',known.mean())
def guided(I,p,r=6,eps=2e-3):
    bf=lambda x: cv2.boxFilter(x,-1,(2*r+1,2*r+1))
    mI=bf(I); mp=bf(p); a=(bf(I*p)-mI*mp)/(bf(I*I)-mI*mI+eps); b=mp-a*mI
    return bf(a)*I+bf(b)
cache={}
def gated(k):
    k=min(max(k,0),N-1)
    if k in cache: return cache[k]
    m=raw(k); im=img(k)
    d=np.sqrt(((im-plate)**2).sum(2))
    fg=np.clip((d-28)/22,0,1); fg[~known]=1
    fg=cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    fg=cv2.dilate(fg,np.ones((15,15),np.uint8)); fg=cv2.GaussianBlur(fg,(0,0),4)
    g=m*np.clip(fg*1.2,0,1)
    # keep the biggest blob only
    n,lab,st,_=cv2.connectedComponentsWithStats((g>.4).astype(np.uint8))
    if n>1:
        big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); keep=cv2.dilate((lab==big).astype(np.uint8),np.ones((25,25),np.uint8))
        g=g*cv2.GaussianBlur(keep.astype(np.float32),(0,0),5)
    cache[k]=g
    if len(cache)>8: cache.pop(min(cache))
    return g
os.makedirs(f'work/r{i}',exist_ok=True)
start=int(sys.argv[2]) if len(sys.argv)>2 else 0
end=int(sys.argv[3]) if len(sys.argv)>3 else N
for k in range(start,end):
    A=sum(gated(k+o)*w for o,w in {-2:1,-1:2,0:3,1:2,2:1}.items())/9
    M=gated(k); f=np.clip((np.abs(M-A)-.18)/.30,0,1); m=A+(M-A)*f
    gray=cv2.cvtColor(img(k).astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    sm=cv2.resize(gray,(540,960)); mm=cv2.resize(m,(540,960))
    m=cv2.resize(guided(sm,mm),(W_,H_),interpolation=cv2.INTER_LINEAR)
    m=np.clip((m-.30)/.45,0,1)
    out=np.zeros((H_,W_,4),np.uint8); out[...,3]=(m*255).astype(np.uint8)
    cv2.imwrite(f'work/r{i}/{k:05d}.png',out,[cv2.IMWRITE_PNG_COMPRESSION,3])
    if k%100==0: print(i,k,flush=True)

import cv2, numpy as np, os, sys
i=sys.argv[1]; os.makedirs(f'work/q{i}',exist_ok=True)
k1=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)); k2=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15))
done=set(os.listdir(f'work/q{i}')) if len(sys.argv)<3 else set()
for f in sorted(os.listdir(f'work/r{i}')):
    if f in done: continue
    a=cv2.imread(f'work/r{i}/'+f,cv2.IMREAD_UNCHANGED)
    if a is None: continue
    al=a[...,3].astype(np.float32)/255
    rows=np.where((al>.5).any(1))[0]; top=rows[0] if len(rows) else 0
    e1=cv2.erode(al,k1); e2=cv2.erode(al,k2)
    w=np.clip((np.arange(al.shape[0])-(top+300))/80,0,1)[:,None]   # head zone -> stronger erosion
    al=e2*(1-w)+e1*w
    al=cv2.GaussianBlur(al,(0,0),1.4); al=np.clip((al-.08)/.84,0,1)
    a[...,3]=(al*255).astype(np.uint8); cv2.imwrite(f'work/q{i}/'+f,a,[cv2.IMWRITE_PNG_COMPRESSION,3])

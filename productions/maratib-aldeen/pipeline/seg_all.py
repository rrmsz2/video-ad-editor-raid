import onnxruntime as ort, numpy as np, cv2, os, sys
so=ort.SessionOptions(); so.intra_op_num_threads=int(sys.argv[1])
s=ort.InferenceSession('/root/.u2net/u2net_human_seg.onnx',so,providers=['CPUExecutionProvider'])
nm=s.get_inputs()[0].name
for i in sys.argv[2:]:
    fs=sorted(os.listdir(f'f{i}'))
    for f in fs:
        out=f'm{i}/'+f.replace('.jpg','.png')
        if os.path.exists(out): continue
        im=cv2.imread(f'f{i}/'+f)
        x=cv2.resize(im[:,:,::-1],(320,320),interpolation=cv2.INTER_AREA).astype(np.float32)/255
        x=(x-[0.485,0.456,0.406])/[0.229,0.224,0.225]
        o=s.run(None,{nm:x.transpose(2,0,1)[None].astype(np.float32)})[0][0,0]
        o=np.clip((o-o.min())/(o.max()-o.min()+1e-6),0,1)
        cv2.imwrite(out,(o*255).astype(np.uint8))   # 320x320 raw, upscaled later

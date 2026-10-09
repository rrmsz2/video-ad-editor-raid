import sherpa_onnx, wave, numpy as np, json, subprocess, re, sys
D='/tmp/claude-0/models/sherpa-onnx-whisper-large-v3/large-v3-'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=D+'encoder.int8.onnx',decoder=D+'decoder.int8.onnx',tokens=D+'tokens.txt',language='ar',num_threads=4,tail_paddings=300)
out={}
for i in (1,2,3):
    f=f'work/a{i}.wav'; w=wave.open(f); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; dur=len(a)/16000
    log=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-35dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
    ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)]; se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
    if len(se)<len(ss): se.append(dur)
    # speech = gaps between silences
    sp=[]; cur=0.0
    for s,e in zip(ss,se):
        if s-cur>0.15: sp.append([cur,s])
        cur=e
    if dur-cur>0.15: sp.append([cur,dur])
    res=[]
    for s,e in sp:
        seg=a[max(0,int((s-.15)*16000)):int((e+.15)*16000)]
        st=r.create_stream(); st.accept_waveform(16000,seg); r.decode_stream(st)
        res.append({'s':round(s,3),'e':round(e,3),'text':st.result.text.strip()}); print(i,res[-1],flush=True)
    out[i]=res
json.dump(out,open('work/chunks.json','w'),ensure_ascii=False,indent=1)

# مراتب الدين — حديث جبريل (إسلام حجازي · أبو معاذ)

ريل 9:16 ونسخة يوتيوب 16:9، ببيئة سحابية بلا ماك.

## v4 — مقطع واحد فيه الحديث كامل (الحالي)

| الملف | الدور |
|---|---|
| `pipeline/chunks_full.json` | تفريغ Whisper large-v3 (sherpa-onnx) مقطّع على السكتات — خام قبل التصحيح |
| `pipeline/build_full.py` | النص المصحّح كما نطقه الملقي، أسطر الكابشن (3–5 كلمات)، توقيت الكلمات (طول الكلمة + أقرب انخفاض بالطاقة)، أوقات المشاهد ← `data.json` |
| `pipeline/audio_full.sh` | تنظيف خفيف + قص + معايرة ≈ ‎-14 LUFS / ‎-2 dBTP ← `mix.wav` |
| `pipeline/srt_txt.py` | `.srt` من أسطر الكابشن، و`.txt` نص الحديث كما نُطق مع التنبيه على لفظ الرواية |
| `pipeline/encode.sh` | تجميع بمرورين تحت 30 ميقا، والغلاف أول فريم بالريل |
| `engine/compose.html` | الرسم: الإطار والتدرّج (ريل)، نافذة المحراب (يوتيوب)، الهرم، بطاقات الأركان (5 و6)، بطاقة الإحسان (Amiri)، عنوان الساعة، الكابشن، الختام |
| `engine/render.js` / `cover.js` | رسم الفريمات بكروميوم وضخّها لـffmpeg / الغلاف والثمبنيل |
| `engine/fonts/` | Cairo · Amiri · Reem Kufi (‎@fontsource، رخصة OFL) |
| `pipeline/v1-three-clips/` | خط الإنتاج السابق (3 مقاطع + قص الشخص) — للأرشيف |

### التشغيل

```bash
W=<work>   # فيه src.mp4
ffmpeg -i $W/src.mp4 -vn -ac 1 -ar 16000 $W/a.wav
ffmpeg -i $W/src.mp4 -vn -ac 1 -ar 48000 -c:a pcm_f32le $W/src48.wav
ffmpeg -i $W/src.mp4 -vf "scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_range=tv:out_range=pc,format=yuvj420p" -q:v 2 $W/p1/%05d.jpg
python3 pipeline/build_full.py $W
bash pipeline/audio_full.sh $W
NODE_PATH=<node_modules فيه playwright-core> node engine/render.js $W/data.json reel $W/reel_v.mp4   # و yt
node engine/cover.js $W/data.json reel output/cover-reel.jpg 1 212 0                              # و yt ← thumbnail-youtube.jpg
python3 pipeline/srt_txt.py $W/data.json output
bash pipeline/encode.sh $W output
```

ملفات الفيديو النهائية ما تنرفع للمستودع (حجمها كبير) — تتسلّم بالمحادثة.

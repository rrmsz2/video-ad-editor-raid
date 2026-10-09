#!/bin/bash
# usage: audio_full.sh <work>   -> <work>/mix.wav  (trimmed 1.15-97.30, light denoise, ≈-14 LUFS / <= -2 dBTP (target -13.4: linear mode lands ~0.6 low), 2.6 s silent outro hold)
set -e; W=$1; IN=1.15; OUT=97.30; HOLD=2.6
PRE="highpass=f=70,afftdn=nr=8:nf=-50:tn=1,atrim=$IN:$OUT,asetpts=PTS-STARTPTS,afade=t=in:d=0.12,afade=t=out:st=$(echo "$OUT-$IN-0.22"|bc):d=0.22,apad=pad_dur=$HOLD"
M=$(ffmpeg -hide_banner -i $W/src48.wav -af "$PRE,loudnorm=I=-13.4:TP=-2:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i $W/src48.wav -af "$PRE,loudnorm=I=-13.4:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -ar 48000 -c:a pcm_s16le $W/mix.wav
ffmpeg -hide_banner -i $W/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E " I:|Peak:"

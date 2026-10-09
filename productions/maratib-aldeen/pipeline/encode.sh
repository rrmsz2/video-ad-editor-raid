#!/bin/bash
# usage: encode.sh <work> <out_dir>
# muxes the rendered tracks with mix.wav, 2-pass x264 sized under 30 MB; the reel gets cover-reel.jpg as its first frames (0.1 s)
set -e; W=$1; O=$2; ENG=$(dirname "$0")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $W/mix.wav)
VB=$(python3 -c "print(int(27.5*8192/$DUR-160))")k     # 27.5 MB budget minus 160k audio
enc(){ # in out extra_filter
  local F="$3"; local P="$W/x264_$(basename $2)"
  ffmpeg -v error -y -i $1 $4 -filter_complex "$F" -map "[v]" -c:v libx264 -preset slow -b:v $VB -maxrate 4500k -bufsize 9000k -pass 1 -passlogfile $P -an -f mp4 /dev/null
  ffmpeg -v error -y -i $1 $4 -i $W/mix.wav -filter_complex "$F" -map "[v]" -map $5:a -c:v libx264 -preset slow -b:v $VB -maxrate 4500k -bufsize 9000k -pass 2 -passlogfile $P \
    -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest $2
}
enc $W/reel_v.mp4 $O/maratib-aldeen-reel.mp4 "[1:v]scale=1080:1920,format=yuv420p,setsar=1[cv];[0:v][cv]overlay=0:0:enable='lt(t,0.1)'[v]" "-loop 1 -t 0.2 -i $O/cover-reel.jpg" 2
enc $W/yt_v.mp4 $O/maratib-aldeen-youtube.mp4 "[0:v]null[v]" "" 1
for f in $O/maratib-aldeen-reel.mp4 $O/maratib-aldeen-youtube.mp4; do
  echo "$(basename $f): $(du -m $f|cut -f1) MB, $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f) s"
  ffmpeg -hide_banner -i $f -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E " I:|Peak:" | tr -s ' '
done

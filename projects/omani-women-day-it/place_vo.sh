#!/bin/bash
# يركّب أسطر التعليق الصوتي على أوقاتها الثابتة → vo/vo_full.wav (48k mono)
cd "$(dirname "$0")/vo"
ffmpeg -y -v error \
 -i o_l1.ogg -i o_l2.ogg -i o_l3.ogg -i o_l4.ogg -i o_l5.ogg -i o_l6.ogg -i o_l7.ogg -i o_l8.ogg -i o_l9.ogg \
 -filter_complex "[0]adelay=500|500[a];[1]adelay=8600|8600[b];[2]adelay=18800|18800[c];[3]adelay=23350|23350[d];[4]adelay=27650|27650[e];[5]adelay=32500|32500[f];[6]adelay=38600|38600[g];[7]adelay=45500|45500[h];[8]adelay=56600|56600[i];[a][b][c][d][e][f][g][h][i]amix=inputs=9:normalize=0,aformat=channel_layouts=mono,apad=whole_dur=60" \
 -ar 48000 -ac 1 -c:a pcm_s16le -t 60 vo_full.wav && ffprobe -v error -show_entries format=duration -of csv=p=0 vo_full.wav

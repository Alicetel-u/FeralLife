"""Frame matching ImageGen sprites; crop/translate/resize only, no creative edits.
The older 160px and daily/clean-v2 generations are never inputs to this set.
"""
from pathlib import Path
from PIL import Image
import json
ROOT=Path(__file__).resolve().parents[1]
TARGET=ROOT/'assets/characters/manager/matched-v3'
FRAME=512
FOOT=492
BODY=455
records={}

def package(name,image,anchor_x,baseline,body_height=None,scale=None):
    alpha=image.getchannel('A')
    box=alpha.point(lambda a:255 if a>=128 else 0).getbbox()
    if not box: raise ValueError(name)
    factor=scale if scale is not None else BODY/(body_height or baseline-box[1])
    # Trim source padding before fitting to an identical game frame.
    crop=image.crop(box)
    crop=crop.resize((round(crop.width*factor),round(crop.height*factor)),Image.Resampling.LANCZOS)
    left=round(256-(anchor_x-box[0])*factor)
    top=round(FOOT-(baseline-box[1])*factor)
    if min(left,top)<0 or left+crop.width>FRAME or top+crop.height>FRAME:
        raise ValueError(f'{name} exceeds frame: {left,top,crop.size}')
    frame=Image.new('RGBA',(FRAME,FRAME));frame.alpha_composite(crop,(left,top))
    frame.save(TARGET/(name+'.png'))
    records[name]={'origin':[256,FOOT],'frame':[FRAME,FRAME],'sourceAnchor':[anchor_x,baseline],'packagingScale':factor,'sourceBodyHeight':body_height or baseline-box[1]}

daily=Image.open(TARGET/'sources/daily-sheet.png').convert('RGBA')
# Cells are isolated with gutters; broom bristles are NOT used as shoe anchors.
daily_cells={
 'idle':((70,0,340,378),150,372),
 'clean_a':((390,378,711,743),181,354),
 'clean_b':((774,378,1075,743),147,354),
 'sit':((1140,378,1438,743),147,354),
 'sleep':((0,866,439,1086),229,199),
 'smartphone':((466,741,701,1086),103,338),
 'talk':((798,741,1072,1086),116,340),
 'think':((1144,741,1439,1086),137,340),
}
for name,(rect,x,y) in daily_cells.items():
    # Seated and lying silhouettes retain the same head scale as the source row;
    # their full silhouettes must never be stretched to a standing height.
    factor=BODY/359 if name in ('sit','sleep') else None
    package(name,daily.crop(rect),x,y,scale=factor)
walk=Image.open(TARGET/'sources/walk-cycle.png').convert('RGBA')
w,h=walk.size
for index,(name,x,y) in enumerate([('walk_a',392,613),('walk_pass_a',264,617),('walk_b',392,588),('walk_pass_b',265,590)]):
    cell=walk.crop((index%2*w//2,index//2*h//2,(index%2+1)*w//2,(index//2+1)*h//2))
    # One common scale for the COMPLETE cycle preserves head/torso continuity.
    package(name,cell,x,y,scale=BODY/581)
# These approved expressions share the new neutral master. Reframe their pivots
# once at packaging time; runtime never applies pose-specific scale multipliers.
for name,x in {'angry':232.5,'happy':251,'neutral':256,'sad':235,'serious':261,'shy':226,'surprised':215.5,'tired':253,'troubled':243}.items():
    image=Image.open(ROOT/f'assets/characters/manager/new-poses/emotions/{name}.png').convert('RGBA')
    box=image.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    package(name,image,x,box[3])
(TARGET/'asset.json').write_text(json.dumps({'master':'../new-poses/emotions/neutral.png','method':'Built-in ImageGen, matched daily sheet and four-frame walking cycle; framing only','standingBodyHeight':BODY,'displayHeight':44*FRAME/BODY,'origin':[256,FOOT],'poses':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Packaged {len(records)} matching landlord frames')


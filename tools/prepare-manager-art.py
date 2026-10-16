"""Package approved ImageGen RGBA artwork into game frames; no creative image edits."""
from pathlib import Path
from PIL import Image
import json
from statistics import median
root=Path(__file__).resolve().parents[1]/'assets'/'characters'/'manager'
frames={}
for source in sorted((root/'sources').glob('*.png')):
 image=Image.open(source).convert('RGBA');alpha=image.getchannel('A');box=alpha.point(lambda value:255 if value>=128 else 0).getbbox()
 if not box or alpha.getextrema()!=(0,255):raise ValueError('Expected transparent artwork: '+source.name)
 # Anchor to dark shoes rather than to a broom or an outstretched arm.
 shoes=[]
 for y in range(box[1]+int((box[3]-box[1])*.88),box[3]):
  for x in range(box[0],box[2]):
   r,g,b,a=image.getpixel((x,y))
   if a>200 and max(r,g,b)<100:shoes.append((x,y))
 center=median(x for x,y in shoes) if shoes else (box[0]+box[2])/2
 baseline=max(y for x,y in shoes)+1 if shoes else box[3]
 scale=min(140/(box[3]-box[1]),74/max(1,center-box[0]),74/max(1,box[2]-center))
 crop=image.crop(box);crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
 frame=Image.new('RGBA',(160,160));left=round(80-(center-box[0])*scale);top=156-crop.height
 if left<0 or top<0 or left+crop.width>160 or top+crop.height>160:raise ValueError('Artwork exceeds frame: '+source.name)
 frame.alpha_composite(crop,(left,top));target=root/'idle.png' if source.stem=='idle' else root/'poses'/source.name
 frame.save(target);frames[source.stem]={'source':'sources/'+source.name,'file':str(target.relative_to(root)).replace('\\','/'),'size':[160,160],'origin':[80,156]}
(root/'asset.json').write_text(json.dumps({'character':'manager','method':'Built-in ImageGen; RGBA framing with nearest-neighbor scaling','displayHeight':44,'frame':{'width':160,'height':160,'origin':[80,156]},'poses':frames},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Packaged '+str(len(frames))+' landlord poses')

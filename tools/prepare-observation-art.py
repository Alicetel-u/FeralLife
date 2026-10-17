"""Pack native-resolution observation sprites; no small intermediate resize."""
import argparse,json,re
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
parser=argparse.ArgumentParser()
for key in ['cat-emotions','hostess-emotions','cat-actions','hostess-actions']:parser.add_argument('--'+key,required=True)
args=vars(parser.parse_args());root=Path(__file__).resolve().parents[1]
source=(root/'src/mini-emotions.js').read_text(encoding='utf-8')
metadata={}
base=['happy','angry','sad','surprised','confused','scared','relieved','shy']
extras={'cat':['furious','panic','despair','pleading','stunned','laughing','exasperated','rejecting'],'hostess':['furious','panic','despair','pleading','stunned','laughing','flirt-wink','flirt-lean']}
actions=['stand','walk_a','walk_b','sit','sleep','eat','drink','clean','chat']
def clean(im,core):
 data=np.array(im.convert('RGBA'));alpha=data[:,:,3]
 distance=ndimage.distance_transform_edt(~core)
 fringe=(distance<=2)&(alpha>32)&(~core)
 out=np.zeros_like(alpha);out[core]=255;out[fringe]=np.minimum(254,np.round((alpha[fringe].astype(float)-32)/223*255)).astype('uint8')
 data[:,:,3]=out;data[out==0,:3]=0
 return Image.fromarray(data)
def split_nine(im):
 alpha=np.array(im.getchannel('A'));core=alpha>=192
 labels,count=ndimage.label(core);sizes=np.bincount(labels.ravel());sizes[0]=0
 # A generated atlas can have two sprites touching at a shoe/hair tip.
 # Split only at the narrowest row seam rather than treating background as sprite nine.
 if np.count_nonzero(sizes>10000)<9:
  h,w=core.shape
  for col in range(3):
   left,right=round(col*w/3),round((col+1)*w/3)
   for row in [1,2]:
    middle=round(row*h/3);radius=round(h/22);lo,hi=middle-radius,middle+radius
    seam=lo+np.argmin(core[lo:hi,left:right].sum(axis=1));core[seam,left:right]=False
  labels,count=ndimage.label(core);sizes=np.bincount(labels.ravel());sizes[0]=0
 assert np.count_nonzero(sizes>10000)==9,'atlas must contain nine complete bodies'

 main=np.argsort(sizes)[-9:];centroid=ndimage.center_of_mass(alpha,labels,list(range(1,count+1)))
 center=lambda label:centroid[int(label)-1]
 main=sorted(main,key=lambda label:center(label)[0]);order=[]
 for row in range(3):order.extend(sorted(main[row*3:(row+1)*3],key=lambda label:center(label)[1]))
 boxes=ndimage.find_objects(labels)
 centers={int(label):center(label) for label in order};groups={int(label):[int(label)] for label in order}
 for label in np.flatnonzero(sizes>=12):
  if int(label) in groups:continue
  cy,cx=center(label);nearest=min(centers,key=lambda k:(centers[k][0]-cy)**2+(centers[k][1]-cx)**2)
  if cy<boxes[nearest-1][0].stop and (centers[nearest][0]-cy)**2+(centers[nearest][1]-cx)**2<300**2:groups[nearest].append(int(label))
 result=[]
 for label in order:
  sprite=clean(im,np.isin(labels,groups[int(label)]))
  # Do not restore the next row's hair through a foot-touching seam.
  bottom=boxes[int(label)-1][0].stop
  if bottom<im.height:sprite.paste((0,0,0,0),(0,bottom,im.width,im.height))
  result.append(sprite)
 return result
emotions={'cat':['happy','angry','sad','surprised','confused','scared','relieved','shy','exasperated'],'hostess':['happy','angry','sad','surprised','scared','confused','charm','flirt-wink','wicked']}
for who in ['cat','hostess']:
 im=Image.open(args[who+'_emotions']).convert('RGBA');atlas=Image.new('RGBA',im.size);frames={}
 for name,sprite in zip(emotions[who],split_nine(im)):
  bbox=sprite.getbbox();assert bbox;atlas.alpha_composite(sprite)
  frames[name]=[bbox[0],bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]]
 asset=f'assets/characters/{who}/emotions-v4.png';atlas.save(root/asset,optimize=True)
 entry="  "+who+": {src:'"+asset+"',image:null,height:"+str(max(f[3] for f in frames.values()))+",frames:{\n"+''.join("    '"+n+"':"+json.dumps(f,separators=(',',':'))+",\n" for n,f in frames.items())+'  }},'
 source,count=re.subn(r'  '+who+r": \{src:.*?\n  \}\},",lambda _:entry,source,count=1,flags=re.S);assert count==1
 poses={};folder=root/f'assets/characters/{who}/observation-v4';folder.mkdir(exist_ok=True)
 im=Image.open(args[who+'_actions']).convert('RGBA')
 for name,sprite in zip(actions,split_nine(im)):
  bbox=sprite.getbbox();assert bbox;sprite=sprite.crop(bbox);path=folder/(name+'.png');sprite.save(path,optimize=True)
  poses[name]={'src':path.relative_to(root).as_posix(),'origin':[sprite.width/2,sprite.height],'width':sprite.width,'height':sprite.height}
 assert min(poses[n]['height'] for n in ['stand','walk_a','walk_b','chat'])>=300
 metadata[who]=poses
(root/'src/mini-emotions.js').write_text(source,encoding='utf-8')
(root/'src/observation-art.js').write_text('// Native-resolution action sprites matching the current nine emotional mini sprites.\nexport const OBSERVATION_ACTION_ART = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps({k:{n:[v['width'],v['height']] for n,v in poses.items()} for k,poses in metadata.items()}))

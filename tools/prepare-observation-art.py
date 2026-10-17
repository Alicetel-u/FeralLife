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
for who in ['cat','hostess']:
 im=Image.open(args[who+'_emotions']).convert('RGBA');w,h=im.size
 atlas=Image.new('RGBA',im.size);frames={}
 for i,name in enumerate(base+extras[who]):
  x,y=round((i%4)*w/4),round((i//4)*h/4)
  cell=im.crop((x,y,round((i%4+1)*w/4),round((i//4+1)*h/4)))
  a=np.array(cell.getchannel('A'));labels,count=ndimage.label(a>= (248 if who=='cat' else 192));sizes=np.bincount(labels.ravel());sizes[0]=0
  core=np.isin(labels,np.flatnonzero(sizes>=max(20,sizes.max()*.0004)))
  sprite=clean(cell,core);bbox=sprite.getbbox();assert bbox
  atlas.paste(sprite,(x,y));frames[name]=[x+bbox[0],y+bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]]
 asset=f'assets/characters/{who}/emotions-v3.png';atlas.save(root/asset,optimize=True)
 entry="  "+who+": {src:'"+asset+"',image:null,height:"+str(max(f[3] for f in frames.values()))+",frames:{\n"+''.join("    '"+n+"':"+json.dumps(f,separators=(',',':'))+",\n" for n,f in frames.items())+'  }},'
 source,count=re.subn(r'  '+who+r": \{src:.*?\n  \}\},",lambda _:entry,source,count=1,flags=re.S);assert count==1
 im=Image.open(args[who+'_actions']).convert('RGBA');alpha=np.array(im.getchannel('A'))
 labels,count=ndimage.label(alpha>=192);sizes=np.bincount(labels.ravel());sizes[0]=0
 main=sorted(np.argsort(sizes)[-9:],key=lambda label:ndimage.center_of_mass(labels==label))
 # Sort three rows, then left-to-right; use connected components so feet crossing a grid line stay intact.
 order=[]
 for row in range(3):order.extend(sorted(main[row*3:(row+1)*3],key=lambda label:ndimage.center_of_mass(labels==label)[1]))
 centers={int(label):ndimage.center_of_mass(labels==label) for label in order};groups={int(label):[int(label)] for label in order}
 for label in np.flatnonzero(sizes>=12):
  if int(label) in groups:continue
  cy,cx=ndimage.center_of_mass(labels==label)
  nearest=min(centers,key=lambda k:(centers[k][0]-cy)**2+(centers[k][1]-cx)**2)
  if (centers[nearest][0]-cy)**2+(centers[nearest][1]-cx)**2<300**2:groups[nearest].append(int(label))
 folder=root/f'assets/characters/{who}/observation-v3';folder.mkdir(exist_ok=True)
 poses={}
 for name,label in zip(actions,order):
  sprite=clean(im,np.isin(labels,groups[int(label)]));bbox=sprite.getbbox();assert bbox
  sprite=sprite.crop(bbox);path=folder/(name+'.png');sprite.save(path,optimize=True)
  poses[name]={'src':path.relative_to(root).as_posix(),'origin':[sprite.width/2,sprite.height],'width':sprite.width,'height':sprite.height}
 assert min(poses[n]['height'] for n in ['stand','walk_a','walk_b','chat'])>=300
 metadata[who]=poses
(root/'src/mini-emotions.js').write_text(source,encoding='utf-8')
(root/'src/observation-art.js').write_text('// Native-resolution action sprites matching the sixteen-emotion mini characters.\nexport const OBSERVATION_ACTION_ART = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps({k:{n:[v['width'],v['height']] for n,v in poses.items()} for k,poses in metadata.items()}))

"""Export generated Mimi atlases into registered RGBA game frames.
No painting or recoloring: preserve source pixels/alpha inside each sprite mask.
Usage: python tools/prepare-mimi-art.py --actions atlas.png --emotions atlas.png
"""
import argparse,json,re
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter
ROOT=Path(__file__).resolve().parents[1]
ACTIONS=['stand','walk_a','walk_b','sit','sleep','eat','drink','clean','chat']
EMOTIONS=['happy','angry','sad','surprised','confused','scared','relieved','shy','exasperated']

def components(mask):
    parent=[0];runs=[];previous=[]
    def find(a):
        while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
        return a
    for y,row in enumerate(mask):
        edges=np.flatnonzero(np.diff(np.r_[False,row,False].astype(np.int8)))
        current=[]
        for x0,x1 in zip(edges[::2],edges[1::2]):
            label=len(parent);parent.append(label)
            for p0,p1,pl in previous:
                if p1<x0:continue
                if p0>x1:break
                a,b=find(label),find(pl)
                if a!=b:parent[a]=b
            current.append((int(x0),int(x1),label));runs.append((y,int(x0),int(x1),label))
        previous=current
    labels=np.zeros(mask.shape,dtype=np.int32);stats={}
    for y,x0,x1,label in runs:
        label=find(label);labels[y,x0:x1]=label
        if label not in stats:stats[label]=[0,x0,y,x1,y+1]
        v=stats[label];v[0]+=x1-x0;v[1]=min(v[1],x0);v[2]=min(v[2],y);v[3]=max(v[3],x1);v[4]=max(v[4],y+1)
    return labels,stats

def split(path):
    im=Image.open(path).convert('RGBA');data=np.asarray(im);alpha=data[:,:,3];core=alpha>=128
    labels,stats=components(core);main=[k for k,v in stats.items() if v[0]>10000]
    if len(main)!=9:
        for col in range(3):
            l,r=round(col*im.width/3),round((col+1)*im.width/3)
            for row in [1,2]:
                mid=round(row*im.height/3);radius=round(im.height/17);lo,hi=mid-radius,mid+radius
                seam=lo+np.argmin(core[lo:hi,l:r].sum(axis=1));core[seam,l:r]=False
        labels,stats=components(core);main=[k for k,v in stats.items() if v[0]>10000]
    assert len(main)==9,f'{path}: expected 9 bodies, found {len(main)}'
    center=lambda k:((stats[k][2]+stats[k][4])/2,(stats[k][1]+stats[k][3])/2)
    main.sort(key=center);order=[]
    for row in range(3):order.extend(sorted(main[row*3:(row+1)*3],key=lambda k:center(k)[1]))
    groups={k:[k] for k in main}
    for k,v in stats.items():
        if k in groups or v[0]<4:continue
        cy,cx=center(k)
        nearest=min(main,key=lambda m:(center(m)[0]-cy)**2+(center(m)[1]-cx)**2)
        if (center(nearest)[0]-cy)**2+(center(nearest)[1]-cx)**2<230**2:groups[nearest].append(k)
    result=[]
    for k in order:
        mask=Image.fromarray((np.isin(labels,groups[k])*255).astype('uint8')).filter(ImageFilter.MaxFilter(5))
        out=data.copy();out[:,:,3]=np.where(np.asarray(mask)>0,alpha,0);out[out[:,:,3]==0,:3]=0
        sprite=Image.fromarray(out);box=sprite.getbbox();result.append(sprite.crop(box))
    return result

def run(actions,emotions,passing=None):
    poses=split(actions);reactions=split(emotions)
    scale=455/poses[0].height
    folder=ROOT/'assets/characters/rabbit/observation-v1';folder.mkdir(exist_ok=True)
    metadata={}
    # Every action shares one scale, canvas, floor and pivot; sleeping is never stretched upright.
    for name,sprite in zip(ACTIONS,poses):
        size=(round(sprite.width*scale),round(sprite.height*scale));assert max(size)<=492,(name,size)
        sprite=sprite.resize(size,Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(512,512));canvas.alpha_composite(sprite,(256-size[0]//2,492-size[1]))
        path=folder/(name+'.png');canvas.save(path,optimize=True)
        metadata[name]={'src':path.relative_to(ROOT).as_posix(),'origin':[256,492],'width':512,'height':512}
    if passing:
        # The edited passing frame retains the reference canvas and upper-body registration.
        frame=Image.open(passing).convert('RGBA').resize((512,512),Image.Resampling.LANCZOS)
        frame.save(folder/'walk_b.png',optimize=True)
    atlas=Image.new('RGBA',(1536,1536));frames={};emotion_scale=455/max(s.height for s in reactions)
    for i,(name,sprite) in enumerate(zip(EMOTIONS,reactions)):
        size=(round(sprite.width*emotion_scale),round(sprite.height*emotion_scale));sprite=sprite.resize(size,Image.Resampling.LANCZOS)
        x,y=(i%3)*512,(i//3)*512;atlas.alpha_composite(sprite,(x+256-size[0]//2,y+492-size[1]));frames[name]=[x,y,512,512]
    atlas.save(ROOT/'assets/characters/rabbit/emotions-v2.png',optimize=True)
    path=ROOT/'src/observation-art.js';source=path.read_text(encoding='utf-8');table=json.loads(source[source.index('{'):source.rindex('}')+1]);table['rabbit']=metadata
    path.write_text('// Registered native-resolution action sprites.\nexport const OBSERVATION_ACTION_ART = '+json.dumps(table,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    path=ROOT/'src/mini-emotions.js';source=path.read_text(encoding='utf-8');entry="  rabbit: {src:'assets/characters/rabbit/emotions-v2.png',image:null,height:512,frames:"+json.dumps(frames,separators=(',',':'))+'},'
    start=source.index('  rabbit: {src:');end=source.index('  wolf:',start);source=source[:start]+entry+'\n'+source[end:];path.write_text(source,encoding='utf-8')
    (folder/'asset.json').write_text(json.dumps({'canvas':[512,512],'origin':[256,492],'actionScale':scale,'emotionScale':emotion_scale,'actions':ACTIONS,'emotions':EMOTIONS},indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'actions':{name:list(sprite.size) for name,sprite in zip(ACTIONS,poses)},'emotions':len(frames),'scale':scale}))
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--actions',required=True);parser.add_argument('--emotions',required=True);parser.add_argument('--passing');args=parser.parse_args();run(args.actions,args.emotions,args.passing)

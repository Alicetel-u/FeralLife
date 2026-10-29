"""Register the generated map-only rifle pose to the approved landlord frame.
Only alpha bounds, uniform resize and placement; no painting or runtime scale overrides.
"""
import argparse,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def package(source,walk=None):
    image=Image.open(source).convert('RGBA');alpha=image.getchannel('A');box=alpha.point(lambda v:255 if v>=128 else 0).getbbox();assert box
    bottom=box[3];shoe_band=alpha.crop((0,round(box[1]+(bottom-box[1])*.86),image.width,bottom));shoe_box=shoe_band.point(lambda v:255 if v>=128 else 0).getbbox();assert shoe_box
    anchor=(shoe_box[0]+shoe_box[2])/2;scale=455/(bottom-box[1]);crop=image.crop(box);size=(round(crop.width*scale),round(crop.height*scale));crop=crop.resize(size,Image.Resampling.LANCZOS)
    x=round(256-(anchor-box[0])*scale);y=37;assert x>=0 and x+size[0]<=512 and y+size[1]<=512
    frame=Image.new('RGBA',(512,512));frame.alpha_composite(crop,(x,y));folder=ROOT/'assets/characters/manager/matched-v3';frame.save(folder/'map-rifle.png',optimize=True)
    (folder/'map-rifle.json').write_text(json.dumps({'reference':'idle.png','frame':[512,512],'origin':[256,492],'standingBodyHeight':455,'sourceAnchor':[anchor,bottom],'packagingScale':scale,'use':'Act III street map only'},indent=2)+'\n',encoding='utf-8')
    if walk:
        sheet=Image.open(walk).convert('RGBA');sprites=[]
        for i in range(4):
            cell=sheet.crop((i%2*sheet.width//2,i//2*sheet.height//2,(i%2+1)*sheet.width//2,(i//2+1)*sheet.height//2));bounds=cell.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();assert bounds;sprites.append(cell.crop(bounds))
        factor=455/max(sprite.height for sprite in sprites)
        for name,sprite in zip(['walk_a','walk_pass_a','walk_b','walk_pass_b'],sprites):
            head=sprite.getchannel('A').crop((0,0,sprite.width,round(sprite.height*.46))).point(lambda v:255 if v>=128 else 0).getbbox();assert head
            center=(head[0]+head[2])/2;size=(round(sprite.width*factor),round(sprite.height*factor));sprite=sprite.resize(size,Image.Resampling.LANCZOS)
            left=round(256-center*factor);assert left>=0 and left+size[0]<=512
            frame=Image.new('RGBA',(512,512));frame.alpha_composite(sprite,(left,37));frame.save(folder/('map-rifle-'+name+'.png'),optimize=True)
        info=json.loads((folder/'map-rifle.json').read_text(encoding='utf-8'));info['walkScale']=factor;info['walkCycle']=['walk_a','walk_pass_a','walk_b','walk_pass_b'];(folder/'map-rifle.json').write_text(json.dumps(info,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'frame':[512,512],'origin':[256,492],'bounds':frame.getbbox()}))
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source');parser.add_argument('--walk');args=parser.parse_args();package(args.source,args.walk)

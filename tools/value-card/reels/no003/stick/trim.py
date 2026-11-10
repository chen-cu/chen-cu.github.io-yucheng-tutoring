import wave,glob,os,sys,numpy as np
src,dst=sys.argv[1],sys.argv[2]; SR=24000
def rd(f):
    w=wave.open(f); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)
tot=0
for f in sorted(glob.glob(src+'/*.wav')):
    a=rd(f); win=int(SR*.02); n=len(a)//win
    rms=np.sqrt((a[:n*win].reshape(n,win)**2).mean(1)); db=20*np.log10(rms+1e-6)-90.3
    on=db>-40
    i0=max(np.argmax(on)-2,0); i1=min(n-np.argmax(on[::-1])+3,n)
    # compress internal silences > 0.45s down to 0.4s
    keep=[]; run=0
    for i in range(i0,i1):
        if on[i]: run=0; keep.append(i)
        else:
            run+=1
            if run<=20: keep.append(i)
    out=np.concatenate([a[i*win:(i+1)*win] for i in keep])
    # fade edges
    fl=int(SR*.01); out[:fl]*=np.linspace(0,1,fl); out[-fl:]*=np.linspace(1,0,fl)
    w=wave.open(os.path.join(dst,os.path.basename(f)),'wb'); w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes(out.astype(np.int16).tobytes()); d=len(out)/SR; tot+=d
    print(os.path.basename(f),round(len(a)/SR,2),'->',round(d,2))
print('total',round(tot,2))

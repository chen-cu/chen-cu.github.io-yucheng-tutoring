import json,re,numpy as np,wave,subprocess,sys
SR=44100
s=open('web/words.js',encoding='utf-8').read()
L=json.loads(re.search(r'const LINES=(.*);',s).group(1))
P=re.compile(r'[，。！？、：；「」…\s]')
cnt=lambda x:len([c for c in x if not P.match(c)])
def tAt(i,sub):
    t=L[i]['text'];k=t.find(sub);return L[i]['s']+(L[i]['e']-L[i]['s'])*cnt(t[:k])/cnt(t)
Ls=lambda i:L[i]['s']; Le=lambda i:L[i]['e']
T=lambda d:np.arange(int(SR*d))/SR
def env(n,a=.005,r=None):
    e=np.ones(n);na=int(SR*a);e[:na]=np.linspace(0,1,na)
    return e*np.exp(-np.arange(n)/SR*(r or 8))
def pop(): t=T(.12);f=np.linspace(900,300,len(t));return .6*np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.002,30)
def ding(f0=1320): t=T(1.0);return .35*sum(a*np.sin(2*np.pi*f0*m*t) for m,a in [(1,1),(2.76,.4),(5.4,.15)])*env(len(t),.002,4)
def whoosh(d=.35):
    n=int(SR*d);x=np.random.default_rng(1).normal(0,1,n);k=np.sin(np.linspace(0,np.pi,n))**2
    y=np.convolve(x,np.ones(30)/30,'same');return .5*y*k
def boing(f0=220,f1=520,d=.35): t=T(d);f=np.linspace(f0,f1,len(t))*(1+.08*np.sin(2*np.pi*14*t));return .45*np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.003,6)
def thud(): t=T(.5);f=np.linspace(120,45,len(t));y=np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(t),.002,9);n=np.random.default_rng(2).normal(0,1,len(t))*env(len(t),.001,40)*.4;return .8*(y+n)
def crack(): n=int(SR*.25);x=np.random.default_rng(3).normal(0,1,n);x*=(np.random.default_rng(4).random(n)>.97)*1.0+.05;return .5*x*env(n,.001,12)
def coin(): return ding(2400)*.6+np.concatenate([np.zeros(int(SR*.08)),ding(3000)*.4])[:int(SR*1.0)]
def tap(): t=T(.06);return .5*np.sin(2*np.pi*1800*t)*env(len(t),.001,60)
def sadtromb():
    out=[]
    for f,d in [(392,.42),(370,.42),(349,.42),(330,1.1)]:
        t=T(d);vib=1+(.02*np.sin(2*np.pi*6*t) if d>1 else 0);ph=np.cumsum(f*vib)/SR*2*np.pi
        y=sum(np.sin(k*ph)/k for k in range(1,7));e=np.minimum(1,t/.03)*np.minimum(1,(d-t)/.08);out.append(.18*y*e)
    return np.concatenate(out)
ev=[]
ev+= [(tAt(0,'送分題'),pop()),(tAt(0,'六分之一'),pop()),(tAt(0,'收工'),ding())]
ev+= [(Ls(1)-.1,whoosh()),(tAt(1,'第三行'),tap()),(tAt(1,'第三行')+.12,tap())]
ev+= [(Ls(2)-.1,whoosh(.25)),(tAt(2,'然後呢'),boing(300,700,.3))]
ev+= [(Ls(3)-.1,whoosh(.25))]
dt=(Le(3)-Ls(3)-.2)/9
for j,ch in enumerate('WRWWRWRWR'):
    st=Ls(3)-.08+.25+j*dt
    ev.append((st,boing(400,700,.18)*.6 if ch=='W' else pop()))
    if ch=='W': ev.append((st+dt*.9,tap()))
ev+= [(Ls(4),boing(180,900,.4))]
tz=tAt(5,'零用錢'); ev+= [(tz,coin()),(tz+.25,thud()),(tz+.3,crack())]
ev+= [(Ls(6)-.1,whoosh(.25)),(tAt(6,'五十六'),pop()),(tAt(6,'五十六')+.05,ding(1100))]
t3=tAt(7,'二十八分之三'); ev+= [(t3,pop()),(t3+.05,ding(1568)),(t3+1.2,whoosh(.2))]
ev+= [(Ls(8)-.1,whoosh(.25)),(Ls(8)+.1,sadtromb())]
ev+= [(tAt(9,'留言'),pop()),(Le(9),ding(1320))]
dur=float(sys.argv[1]); out=np.zeros(int(SR*dur)+SR*2)
for st,x in ev:
    i=int(st*SR); out[i:i+len(x)]+=x[:len(out)-i]
out=np.clip(out*.55,-1,1)[:int(SR*dur)]
w=wave.open('audio/sfx.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((out*32767).astype(np.int16).tobytes())
print('events',len(ev))

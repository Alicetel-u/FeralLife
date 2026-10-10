// Authored scenes. Effects are data so delayed consequences survive save/restore.
const caseChoice = (id, label, hint, effects, reply, follow = null) => ({ id, label, hint, effects, reply, follow });
const caseReport = (delay, title, text, effects = {}, next = null) => ({ delay, title, text, effects, next });

export const MANAGEMENT_CASES = {
  cigarette: {
    title: '灰皿の外にも、灰皿があると思っていた。', cast: ['cat'], day: 2,
    detail: '廊下に焦げた布のにおい。モクの部屋では、消したつもりのタバコが座布団に小さな穴を作っている。まだ全焼ではない。まだ。',
    lines: [['cat','あれ、座布団って線香のにおいするっけニャ？'],['manager','灰皿から煙が出るのと、座布団から出るのは別の話です。'],['cat','穴が小さいうちに、相談しておくニャ。']],
    choices: [
      caseChoice('check','一緒に確認し、防火用の灰皿を渡す','費用は小さめ。部屋の傷みは応急処置になる。',{funds:-2200,safety:7,trust:8,residents:{cat:{stress:3,trash:-4}}},'消す場所が決まったニャ。あとは、そこまで手を伸ばすだけニャ。',caseReport(8,'穴だけが、立派に残った。','煙は止まった。モクは座布団の穴を裏返して隠し、「両面使えてお得」と言った。',{safety:-2})),
      caseChoice('inspect','業者に点検と修繕を頼む','費用は高め。安全を優先するが、モクは部屋を空ける。',{funds:-6500,safety:17,trust:-2,repairs:1},'業者さん、部屋の散らかりまで点検するのかニャ……。',caseReport(12,'修繕中の荷物が廊下に並んだ。','壁より先に、積み上がった缶の避難先が必要になった。',{safety:2},'roomshare')),
      caseChoice('leave','モクに任せ、後で確認する','今は支出なし。寝落ちすると被害が広がる。',{trust:2},'任せるニャ。消してから寝る。順番だけは覚えてるニャ。',caseReport(6,'消す前に、寝ていた。','けが人はなかったが、座布団と壁紙が焦げた。モクは「順番、逆だったニャ」と、修繕の見積もりを差し出した。',{funds:-14000,safety:-21,trust:-9,repairs:1,residents:{cat:{stress:18}}},'roomshare'))
    ]
  },
  quit_smoking: {
    title:'「最後の一本」の予約が三本ある。',cast:['cat'],day:3,requires:'cigarette',
    detail:'モクが禁煙すると言い出した。掲示板には「応援歓迎。説教は有料」と手書きの貼り紙。',
    lines:[['cat','タバコ代、全部ためたら働かなくてもいいんじゃないかニャ。'],['manager','まずは一本減らすところから？'],['cat','減らす一本を、いま吸って選んでるニャ。']],
    choices:[
      caseChoice('gradual','本人と減らす本数を決める','急な我慢は避ける。節約の効果は後から。',{trust:7,funds:-500,residents:{cat:{stress:-6}}},'いきなりゼロじゃないなら、明日から……今日からやるニャ。',caseReport(24,'灰皿の山が、少し低くなった。','モクは浮いた小銭で消臭剤を買った。使う前に、置く場所の掃除が始まった。',{safety:5,solidarity:1,residents:{cat:{cash:1200,trash:-10}}})),
      caseChoice('pledge','みんなの前で禁煙宣言をしてもらう','周囲の協力を得る代わりに、失敗が目立つ。',{trust:-3,buzz:4,residents:{cat:{stress:15}}},'廊下で宣言したら、廊下を通れなくなったニャ。',caseReport(12,'禁煙より先に、口げんかを覚えた。','一本吸うたびに目が合う。モクは見張り役に「肺より先に心が荒れるニャ」と言い返した。',{allStress:8,trust:-4,relations:[['cat','sister',-12]]})),
      caseChoice('no_pressure','本人に任せ、灰皿だけ整える','無理はさせない。節約は進まないが安全は少し上がる。',{funds:-1000,safety:4,trust:3},'禁煙してなくても、消し忘れゼロは目標にするニャ。')
    ]
  },
  collection: {
    title:'掃除で発掘されたのは、黒歴史だった。',cast:['cat','sister'],day:4,
    detail:'ネムが兄の部屋を片づけ、棚の奥から「毎日がんばる猫ちゃん」の限定皿を27枚発見した。モクは一枚も使っていない。',
    lines:[['sister','お兄ちゃん、がんばる猫のお皿だけはコンプリートしてる。'],['cat','がんばる部分は、お皿に任せてるニャ。'],['sister','これ、写真に撮っていい？']],
    choices:[
      caseChoice('ask','見せる範囲をモクに決めてもらう','掃除は進む。本人の秘密は本人が選ぶ。',{trust:7,solidarity:1,relations:[['cat','sister',8]],residents:{cat:{trash:-16}}},'一枚だけならいいニャ。「まず起きる猫ちゃん」の皿で。'),
      caseChoice('auction','本人の了承を得て、一部を売る','修繕費を少し回収。手放す寂しさもある。',{funds:2500,trust:2,residents:{cat:{stress:6,trash:-18}}},'箱のほうが高く売れたニャ。努力より保存状態かニャ。'),
      caseChoice('post','ネムの投稿を面白がって許す','話題になるが、兄の了承を取っていない。',{buzz:15,trust:-8,relations:[['cat','sister',-15]]},'兄の部屋、めっちゃ反応来てる。……本人からは既読も来ない。',caseReport(8,'「がんばる猫」が兄妹をがんばらせた。','投稿のスクリーンショットが、兄のスマホにも届いた。消せば終わり、とはいかなかった。',{},'siblings'))
    ]
  },
  karaoke: {
    title:'深夜二時、アンコールは苦情だった。',cast:['fox'],day:3,
    detail:'ホロの部屋から昔のヒット曲。壁は薄いのに、本人だけが防音だと思っている。',
    lines:[['fox','隣から壁ドン！　これ、拍手の代わり？'],['manager','たぶん、曲を止めてほしい合図です。'],['fox','じゃあ一曲だけ。いちばん長いやつ。']],
    choices:[
      caseChoice('headphones','ヘッドホンを貸して、今日は終わりにする','音は止まる。歌声までは防音にならない。',{funds:-1800,trust:5,allStress:-5},'音楽だけ私に聞こえて、歌だけみんなに聞こえる。逆だったね。',caseReport(6,'廊下に「歌声も音です」の貼り紙。','ホロは貼り紙を読み、やっと口パクに切り替えた。',{safety:1,allStress:-3})),
      caseChoice('daytime','昼の一時間だけ、共用の歌会を作る','費用と準備が必要。参加者同士は近づく。',{funds:-2500,solidarity:2,allStress:-8,buzz:7,relations:[['fox','peko',7]]},'観客、ペコ一人？　お菓子の袋だけ見てない？',caseReport(16,'お菓子が尽きると、アンコールも尽きた。','昼の歌会は好評だった。ホロの歌より、ルナの「終了時間です」がよく通った。',{solidarity:1})),
      caseChoice('fine','騒音の注意書きを強く出す','費用なし。今夜は静かになるが反発が残る。',{trust:-6,allStress:-3,residents:{fox:{stress:14}}},'静かにするよ。……ため息の音量って、規約にある？')
    ]
  },
  wrong_room: {
    title:'鍵は合わないのに、インテリアは合う。',cast:['fox'],day:4,
    detail:'酔ったホロが、開いたままの隣室を自分の部屋と間違えた。勝手に配置された空き缶が、妙に左右対称だ。',
    lines:[['fox','帰ってきたら部屋がきれいすぎたから、私らしく直した。'],['manager','その部屋、あなたの部屋ではありません。'],['fox','道理で、冷蔵庫の中身が残ってた。']],
    choices:[
      caseChoice('restore','本人と元に戻し、ドアに目印をつける','少額の費用。謝る時間は本人に取ってもらう。',{funds:-600,trust:5,solidarity:1,residents:{fox:{trash:-8}}},'私のドアに「ホロ」って書いた。酔っても読める字にしたよ。'),
      caseChoice('compensate','管理費で掃除代を払い、早く収める','お金で収める。住人は原因を忘れやすい。',{funds:-3500,allStress:-5,trust:2},'管理人さん、模様替えのアフターサービスまであるんだね。',caseReport(18,'目印より先に、保証の評判が広まった。','「困ったら管理人が払うらしい」。話だけが、階段を上り下りした。',{trust:-3})),
      caseChoice('exhibit','勝手な模様替えを「作品」として共有する','話題性は高い。家を見世物にされた不満が残る。',{buzz:14,trust:-9,allStress:9},'作品名は「明日の私が片づける」。作者不詳にして。')
    ]
  },
  sober: {
    title:'禁酒三日目の予定表に、乾杯がある。',cast:['fox'],day:5,requires:'karaoke',
    detail:'ホロが三日間の禁酒を宣言した。「達成祝い用」の缶は、もう冷蔵庫にある。',
    lines:[['fox','一人でやると、一人で許しちゃうんだよね。'],['manager','誰かに協力を頼みますか？'],['fox','見張りじゃなくて、一緒にお茶する人がいい。']],
    choices:[
      caseChoice('tea','住人を誘い、夕方のお茶会を作る','飲み物代が必要。孤独を減らして三日を乗り切る。',{funds:-2400,solidarity:2,trust:6,residents:{fox:{stress:-12}}},'このお茶、冷やすとおいしいね。氷を入れるの、久しぶりに酒以外。',caseReport(72,'三日間は達成。四日目の乾杯は、お茶だった。','禁酒祝いの缶は、ペコがゼリー作りに使った。怒る前に、ホロは二つ食べた。',{solidarity:2,residents:{fox:{cash:1800,stress:-10}}},'fridge')),
      caseChoice('deposit','本人の提案で、達成時に戻す預かり金を作る','管理費は使わない。失敗しても預かり金は返す。',{trust:2,residents:{fox:{stress:6}}},'私のお金を、私から守る係なんだね。',caseReport(72,'達成祝いの店を探して、三日が過ぎた。','お店の予約をしなかったので、お金は残った。「禁酒より予約を止めたのが効いた」とホロは言った。',{residents:{fox:{cash:900}},trust:2})),
      caseChoice('cheer','応援だけして、生活は本人に任せる','費用なし。途中でつまずいたら、改めて話せる。',{trust:3},'三日？　一日ずつ三回なら、いける気がする。',caseReport(48,'三日目は、また今度。','二日目の夜に一杯飲んだ。「一日できた記録まで消さないで」と、ホロは新しいカレンダーを開いた。',{residents:{fox:{stress:4}},trust:1}))
    ]
  },
  gift: {
    title:'送り主不明。請求書も、まだ不明。',cast:['hostess'],day:3,
    detail:'ルナ宛てに高級バッグが届いた。カードには「これからもよろしく」。名前も返送先もない。',
    lines:[['hostess','タダって言われる物ほど、後から高いのよね。'],['manager','送り主を確認するまで預かりますか？'],['hostess','使いたい私と、怖い私が、バッグの取り合いしてる。']],
    choices:[
      caseChoice('confirm','ルナと送り主を確認し、受け取る条件を決める','手間と少額の送料。噂になる前に本人が選べる。',{funds:-800,trust:7},'送り主、トクゾウさんだって。「仕事の記念」らしいけど、記念日多すぎ。',caseReport(12,'送り主には、渡したつもりの相手が二人いた。','トクゾウは配送先を間違えていた。ルナは未使用のまま返送し、アンには本人に確認してもらうことにした。',{},'night_talk')),
      caseChoice('return','未開封で返送する手続きを手伝う','送料が必要。ルナには少し心残りがある。',{funds:-1200,trust:4,residents:{hostess:{stress:4}}},'正しい判断した日に限って、夢に出るのよ。あのバッグ。'),
      caseChoice('display','受け取り記念を廊下に貼る','費用なし。羨望と詮索も増える。',{buzz:12,trust:-5,allStress:4},'営業写真のつもりだったのに、捜査資料みたいな質問が来た。',caseReport(12,'「よろしく」の相手が、増えすぎた。','アンが贈り物の箱を見て立ち止まった。廊下は、無料相談の営業時間を延長した。',{relations:[['hostess','ann',-10]]},'night_talk'))
    ]
  },
  missing_bag: {
    title:'高いバッグは、疑いまで高くつく。',cast:['hostess'],day:5,requires:'gift',
    detail:'ルナのバッグが見当たらない。「誰も責めたくない」と言いながら、全員の出入りを覚えている。',
    lines:[['hostess','なくしたって言いたい。でも、なくしたって認めたくない値段なの。'],['manager','最後に使った場所から、一緒に探しましょう。'],['hostess','疑う前に思い出すのって、難しいね。']],
    choices:[
      caseChoice('search','本人と持ち物・出勤先を確認する','時間はかかる。住人を容疑者にしない。',{trust:7,solidarity:1},'店のロッカーにあった。……昨日の自分にだけ事情聴取する。',caseReport(8,'捜索協力のお礼は、バッグの写真だった。','写真の枚数だけは、全員のスマホを圧迫した。疑いをかけられなかったことに、みんな少しほっとしている。',{allStress:-3})),
      caseChoice('notice','名前を出さず、落とし物の掲示をする','少額の費用。少しずつ協力が集まる。',{funds:-300,trust:3,solidarity:2},'「黒いバッグ」って書いたら、私の部屋だけで七個出てきた。'),
      caseChoice('accuse','全員に部屋の中を見せてもらうよう迫る','手早く調べたいが、拒まれた人を疑いやすい。',{trust:-12,allStress:15,relations:[['hostess','peko',-14],['hostess','sister',-10]]},'バッグが戻っても、この空気まで戻せるかな。',caseReport(8,'バッグはロッカーに。疑いは廊下に。','バッグは職場にあった。謝る相手のほうが、探す場所より増えてしまった。',{trust:-4,allStress:4}))
    ]
  },
  address: {
    title:'家賃は安い。位置情報は無料だった。',cast:['hostess'],day:6,
    detail:'ルナのSNS写真に、部屋番号と掲示板が写っていた。見知らぬ人が、建物の前で写真を撮り始める。',
    lines:[['hostess','背景ぼかしたつもりだった。アパート名だけ、妙にくっきり。'],['manager','暮らす場所の公開範囲を、決め直しましょう。'],['hostess','ファンなら、帰ってくれるところまで応援してほしい。']],
    choices:[
      caseChoice('privacy','投稿を直し、私有地への立入りを断る','掲示と防犯の費用。話題は少し落ち着く。',{funds:-4000,safety:12,trust:8,buzz:-10},'住所より先に、ルールを覚えてもらおう。'),
      caseChoice('public_place','別の場所で交流し、生活の住所は隠す','会場費が必要。仕事と生活を分けつつ話題も残る。',{funds:-6500,safety:7,buzz:18,trust:5},'交流会の場所、歩いて来られるけど家は見えない。ちょうどいい距離。',caseReport(24,'差し入れは増えた。玄関前は空いた。','会場で受け取ったお菓子の運搬は、ペコが引き受けた。半分が胃に入る前に、ルナが数を数えた。',{solidarity:1})),
      caseChoice('viral','住人の了承を集め、建物の宣伝に使う','広告収入は後から。人が増えれば安全対策も必要。',{buzz:30,trust:-4,safety:-12},'宣伝文句、「住める炎上スポット」にはしないでよ。',caseReport(24,'撮影だけのはずが、行列になった。','広告収入は入った。苦情の封筒も、同じ厚さで届いた。',{funds:6000,buzz:8,safety:-7,allStress:7}))
    ]
  },
  expose: {
    title:'兄の秘密より、妹の投稿が早かった。',cast:['sister','cat'],day:5,
    detail:'ネムが「兄の部屋を片づけたら」と書きかけた投稿を見せてくる。写真には秘密のコレクションだけでなく、部屋番号まで写っている。',
    lines:[['sister','名前出さなければ、匿名じゃん。'],['cat','兄の顔と部屋番号が、匿名を追い越してるニャ。'],['sister','じゃあ、どこまでなら笑い話にしていい？']],
    choices:[
      caseChoice('agree','兄妹で公開する内容を決める','了承が必要。笑える部分だけが残る。',{trust:6,solidarity:1,relations:[['cat','sister',10]],buzz:5},'お兄ちゃんの秘密じゃなくて、私の掃除失敗談にする。手袋、片方なくしたし。'),
      caseChoice('private','仲のいい人への限定公開にする','拡散は抑えられるが、スクリーンショットは残る。',{trust:2,buzz:7,relations:[['cat','sister',-3]]},'フォロワー十人なら大丈夫。……一人、スクショ早いけど。',caseReport(12,'十人向けの投稿が、十一人目に届いた。','モクは、知らない人から皿の型番を聞かれた。ネムは投稿を消し、兄への言い訳を考え始めた。',{},'siblings')),
      caseChoice('encourage','面白いから、そのまま投稿してもらう','話題になる。モクの信頼と兄妹仲は傷つく。',{buzz:22,trust:-10,relations:[['cat','sister',-20]]},'伸びた。……お兄ちゃんとの距離も、伸びた。',caseReport(8,'笑っているのは、画面の向こうだけ。','玄関に置いたおにぎりが、手つかずのまま返ってきた。',{},'siblings'))
    ]
  },
  limited: {
    title:'家賃は毎月。限定品は今日だけ。',cast:['sister'],day:5,
    detail:'ネムの推しグッズ発売日。家賃用の封筒に手を伸ばし、「これは将来の私に借りるだけ」と言う。',
    lines:[['sister','家賃は待ってくれるけど、販売サイトは待ってくれない。'],['manager','家賃の封筒も、かなり待っています。'],['sister','予算を決めるとき、推しへの愛も計算に入れて。']],
    choices:[
      caseChoice('budget','家賃を確保し、買える数を一緒に決める','欲しい物は減る。支払いと趣味を両立する。',{trust:5,residents:{sister:{stress:4}}},'三個買うつもりが一個。……一個を三倍かわいがる。',caseReport(12,'家賃の封筒に、推しのシールが貼られた。','「払うのが少し楽しくなる」とネムは言う。受け取る側には、毎月違う顔が届きそうだ。',{trust:2})),
      caseChoice('advance','管理費から立て替え、分割で返してもらう','返済は二日後。推しの追加発売があると不安。',{funds:-4000,trust:7},'借用書、推しのクリアファイルに入れた。絶対なくさない。',caseReport(48,'一回目の返済だけは、忘れなかった。','返済のついでに、次の限定品の相談が始まった。',{funds:2500,trust:2})),
      caseChoice('allow','今回は家賃を延期して、買ってもらう','管理資金が減る。住人にも特例が伝わる。',{funds:-2400,trust:3,residents:{sister:{debt:2400}}},'ありがとう。来月の私、よろしくね。',caseReport(24,'限定品じゃない人からも、延期の相談。','ホロは「今夜の一本も限定」と、カレンダーを指した。',{allStress:3,trust:-3}))
    ]
  },
  insinuation: {
    title:'写真の端の手が、廊下の主役になった。',cast:['sister'],day:6,
    detail:'ネムの投稿に映り込んだ、誰かの手。住人たちは恋人の手だと思い込み、本人より先に相手探しを始めた。',
    lines:[['sister','兄に渡すおにぎりの写真なんだけど。'],['manager','説明を出しますか？'],['sister','それはそれで、お兄ちゃんの世話してるのがバレる。']],
    choices:[
      caseChoice('quiet','噂を広げず、聞かれた分だけ訂正する','派手な話題は減る。私生活は守れる。',{trust:6,buzz:-4,allStress:-3},'「おにぎりの共同制作者」って言っておいた。嘘ではない。'),
      caseChoice('luna','本人の了承を取ってルナに相談する','相談相手が増える。意外な交流につながる。',{trust:4,solidarity:1,relations:[['sister','hostess',7]]},'ルナさん、「匂わせるなら家賃払えそうな雰囲気を」だって。',caseReport(8,'匂わせより先に、服の話になった。','ルナは投稿より、ネムのリボンの結び方が気になった。',{},'produce')),
      caseChoice('guess','住人と一緒に、相手当てを楽しむ','費用なしで話題になる。本人は居場所をなくす。',{buzz:13,trust:-7,residents:{sister:{stress:14}}},'私の人生より、みんなの予想のほうが進んでる。')
    ]
  },
  fridge_empty: {
    title:'共同冷蔵庫に、共同の空気だけ残った。',cast:['peko'],day:4,
    detail:'持ち寄り用の棚から食べ物がなくなった。ペコは「共同って、誰か一人でも食べていい意味かと」と、空の皿を持っている。',
    lines:[['peko','全部ひとくちずつだったんです。皿がいっぱいあっただけで。'],['manager','誰の分かを確認する前に、食べてしまったんですね。'],['peko','謝る順番、空腹の人からでいいですか。']],
    choices:[
      caseChoice('repay','本人と少しずつ補充し、名前札をつける','管理費も少し使う。謝罪と区分けで再発を減らす。',{funds:-1800,trust:5,solidarity:1,residents:{peko:{cash:-600,stress:4}}},'札を見てから食べます。「共同」の札だけ、大きくしてほしい。',caseReport(12,'名前札は残り、食料も少し残った。','ペコは自分用の棚にだけ「おかわり可」と書いた。',{solidarity:1,relations:[['peko','fox',5]]})),
      caseChoice('share','残り物用の共有棚を作り、毎日量を決める','初期費用は高め。食べ物と助け合いが循環する。',{funds:-3500,solidarity:3,trust:4,residents:{peko:{hunger:-20}}},'名前のない食べ物じゃなくて、食べていい食べ物。違い、覚えた。',caseReport(24,'共有棚に、食べ切れない缶ゼリー。','ホロの買い置きが、棚の向こうから消えた。',{},'fridge')),
      caseChoice('blame','全員の前でペコを責める','支出なし。犯人探しは終わるが、ご近所づきあいが減る。',{trust:-9,allStress:7,relations:[['peko','fox',-15]],residents:{peko:{stress:15}}},'もう人前で食べないです。……お腹の音は隠せないけど。')
    ]
  },
  contest: {
    title:'特技は食べること。参加費も食べられる。',cast:['peko'],day:6,
    detail:'商店街の大食い大会。参加費二千円、賞金一万八千円。ペコは練習用のお弁当を食べながら、スポンサーを探している。',
    lines:[['peko','優勝すれば、家賃も食費も払えます。'],['manager','賞金まで食べる予定はありませんね？'],['peko','いまのところ、お金は食べられないので。']],
    choices:[
      caseChoice('team','参加費と練習食を出し、応援団をつける','費用四千円。優勝65%。負けても住人の交流は残る。',{funds:-4000,solidarity:2},'応援の声、口いっぱいで返事できなくても聞こえてます！',{...caseReport(12,'結果発表。胃袋にも、予算にも限界がある。','ペコが優勝。賞金の一部を管理費へ返し、初めて「家賃を先に」と言った。',{funds:14000,success:1,residents:{peko:{cash:4000}}}),chance:.65,failure:{text:'あと一皿で敗退。応援団は参加賞のお米を分けて帰った。ペコは「負けてもお腹はいっぱいです」と笑った。',effects:{solidarity:1,residents:{peko:{hunger:-40,stress:5}}}}}),
      caseChoice('entry','参加費だけ立て替える','費用二千円。優勝40%。応援より本人の勝負を尊重。',{funds:-2000,trust:4},'応援席より、空の弁当箱のほうが軽くていいかも。',{...caseReport(12,'大食い大会、ひとりの挑戦。','ペコが優勝し、立替金とお礼を返した。残りは食費の封筒へ入れた。',{funds:6000,success:1,residents:{peko:{cash:12000}}}),chance:.4,failure:{text:'賞金は逃した。ペコは参加賞を抱え、「次は練習代も計算する」と言った。',effects:{residents:{peko:{stress:6,hunger:-30}}}}}),
      caseChoice('job','大会より、賄い付きの臨時仕事を紹介する','手配費五百円。小さな収入と確実な食事になる。',{funds:-500,trust:5,solidarity:1},'食べる前に運ぶ。食べる前に運ぶ。今日は順番を覚えます。',caseReport(12,'完食より、完売で褒められた。','配膳の仕事を終え、ペコは賄いを食べた。売上の一部は管理費への紹介料になった。',{funds:1000,residents:{peko:{cash:2500,hunger:-30}}},'jobs'))
    ]
  },
  soup: {
    title:'炊き出しの予算より、鍋が小さい。',cast:['peko'],day:6,
    detail:'ペコの財布が空になった。住人たちは食べ物を持ち寄ると言うが、最初に届いたのはモクの空き缶だった。',
    lines:[['peko','ごはんの匂いだけでも、借りられませんか。'],['manager','食事と、次の収入を一緒に考えましょう。'],['peko','次の収入の話、食べながらなら聞けます。']],
    choices:[
      caseChoice('pot','管理費で鍋を用意し、持ち寄り会を開く','費用三千円。住人同士が助け合う機会になる。',{funds:-3000,solidarity:3,allStress:-7,residents:{peko:{hunger:-60}},trust:5},'みんなで食べると楽しい。……みんなの分、残すのも覚えます。',caseReport(12,'鍋を囲んで、求人票も回った。','ルナが常連の店に聞き、ネムが募集欄を見つけた。ペコは賄いの欄だけ三回読んだ。',{},'jobs')),
      caseChoice('voucher','食事券を渡して、二人で収入の相談をする','費用千五百円。本人が相談の範囲を選べる。',{funds:-1500,trust:8,residents:{peko:{hunger:-45,stress:-10}}},'困ってるって、言っていいんですね。おかわりと違って。'),
      caseChoice('loan','食費を貸し、来週の返済を約束してもらう','費用二千円。目先は助かるが借金が増える。',{funds:-2000,trust:2,residents:{peko:{cash:2000,debt:2000}}},'来週の私、もうお腹すいてそうだけど……返します。',caseReport(48,'返済の封筒に、ドーナツの割引券。','お金は足りなかった。ペコは封筒の中に、せめて役立つものを入れた。',{trust:-2,residents:{peko:{stress:7}}},'jobs'))
    ]
  },
  midnight: {
    title:'密会の証拠は、コンビニの袋だった。',cast:['ann'],day:8,
    detail:'夜遅く、アンの部屋の前にトクゾウがいた。住人の噂では、花束と札束と婚約指輪まで届いたことになっている。実物はプリン二個。',
    lines:[['ann','見られたのは仕方ない。でも、買ってもない指輪の話までされるの。'],['manager','本人に断りなく、話を広げないよう伝えます。'],['ann','プリンを二人で食べた。それ以上は、私が話すまで待って。']],
    choices:[
      caseChoice('privacy','来客のルールだけ確認し、噂には線を引く','少額の費用。私生活より建物のルールを扱う。',{funds:-500,trust:8,allStress:-3},'プリンは二個。話の盛り具合は、十人前だったね。'),
      caseChoice('luna','アンの了承を得て、ルナとの相談を作る','相談相手が増える。本人が話す範囲を決められる。',{trust:5,solidarity:1,relations:[['ann','hostess',8]]},'ルナなら、聞くことと広めることを分けてくれそう。',caseReport(6,'プリン二個分の、深夜相談。','恋人の話より先に、食費と家賃の話が始まった。',{},'night_talk')),
      caseChoice('rumor','相手の事情を住人に聞き回る','情報は集まる。アンからの相談は来にくくなる。',{buzz:15,trust:-13,allStress:5},'私の話、本人抜きの集会で決まるんだね。')
    ]
  },
  pregnancy: {
    title:'「まだ私の話に、しておいて」。',cast:['ann'],day:12,requires:'midnight',sensitive:true,
    detail:'アンが妊娠したと打ち明けた。今後をどうするかはまだ考えている途中。今日は生活と、秘密の扱いについて相談したいという。',
    lines:[['ann','まだ誰にも話してない。何を望んでるか、私も整理できてない。'],['manager','今、私にできることはありますか？'],['ann','答えを決めるより、暮らせるかどうかを一緒に考えてほしい。']],
    choices:[
      caseChoice('listen','本人の希望を聞き、生活と相談先を整理する','支援の手配費二千円。誰に話すかはアンが決める。',{funds:-2000,trust:10,residents:{ann:{stress:-18}}},'ありがとう。話す相手も、これからのことも、私が決めてから伝える。',caseReport(24,'封筒には、噂ではなく予算表。','アンは必要な支出と連絡先を整理した。「一人で抱えない」と決めることと、「みんなに知らせる」ことは、別にできた。',{trust:5,residents:{ann:{stress:-8}}})),
      caseChoice('permission','誰に協力を頼みたいか、本人と決める','手配費千円。頼れる範囲を本人が選ぶ。',{funds:-1000,trust:8,solidarity:1},'まずルナに話したい。でも、私から言うね。',caseReport(12,'ルナの差し入れには、値札がなかった。','アンが自分の言葉で相談した。ルナは返事を急がせず、食べられるものと生活の予定を一緒に確認した。',{relations:[['ann','hostess',12]],residents:{ann:{stress:-10}}})),
      caseChoice('tell','助けを集めるため、本人に断らず住人へ話す','費用はかからない。本人が選ぶはずの公開範囲を越える。',{trust:-22,residents:{ann:{stress:22}},allStress:3},'助けてほしかった。でも、私の話を配ってほしかったわけじゃない。',caseReport(8,'善意のノックに、返事がなくなった。','心配の声が増えたぶん、アンは扉を開けづらくなった。住人に噂を止めてもらい、本人が話すまで待つ必要が残った。',{trust:-5}))
    ]
  },
  patron_secret: {
    title:'「今度」の予定表には、家族旅行があった。',cast:['ann'],day:10,requires:'midnight',
    detail:'トクゾウの「出張」が家族旅行だったと、アンが知った。別れるかどうかを管理人に決めてほしいわけではない。次の家賃のほうが、先に来る。',
    lines:[['ann','言ってくれればいいのに。知らない私だけが、予定を空けてた。'],['manager','今日は、生活の見通しから話しますか。'],['ann','あの人の約束じゃなくて、私の予定を作りたい。']],
    choices:[
      caseChoice('independence','援助に頼らない収入の計画を手伝う','手配費三千円。収入が増えるまで時間がかかる。',{funds:-3000,trust:9,solidarity:1},'在宅の仕事、もう一件だけ増やしてみる。私の予定に、私の仕事を入れる。',caseReport(48,'待つ時間が、請求書を書く時間になった。','アンは文字起こしの追加案件を終えた。恋人との関係は、本人が落ち着いて話せるときに考えることにした。',{funds:2000,success:1,residents:{ann:{cash:7000,stress:-12}}})),
      caseChoice('mediate','本人が望む範囲で、生活費の約束を記録する','手配費千円。約束は見えるが、相手頼みは続く。',{funds:-1000,trust:5},'口で言った「必ず」より、日付のある紙がほしかった。',caseReport(24,'約束の封筒は、いちおう届いた。','トクゾウは生活費を届けた。アンは封筒をしまい、次の期限を自分の手帳に書いた。',{residents:{ann:{cash:6000}},trust:2})),
      caseChoice('sponsor','トクゾウへ建物への協賛を持ちかける','協賛金は後から。アンの悩みが商売の入口になる。',{trust:-13,buzz:10},'私の相談、いつから営業の紹介状になったの。',caseReport(24,'看板には、トクゾウの名前がいちばん大きい。','協賛金は入った。「住人のため」と書いた看板の下で、アンは管理人への相談を減らした。',{funds:30000,safety:5,buzz:18,success:1,trust:-5}))
    ]
  },
  siblings: {
    title:'既読がついても、仲直りとは限らない。',cast:['cat','sister'],chain:true,
    detail:'ネムの投稿を見たモクが、妹への返事を止めた。部屋の前のおにぎりだけが、兄妹の間を行き来している。',
    lines:[['sister','投稿は消した。だから終わりじゃないの？'],['cat','消す前に、聞いてほしかったニャ。'],['sister','じゃあ、おにぎり置いて逃げるのも、やめる。']],
    choices:[
      caseChoice('talk','二人が話したいときに、短い話し合いを作る','手配費五百円。謝罪も公開範囲も二人で決める。',{funds:-500,trust:6,solidarity:2,relations:[['cat','sister',22]],scenes:{cat:'chat',sister:'chat'}},'ネムに、写真にしていい棚を一段だけ作ったニャ。片づける理由ができたニャ。'),
      caseChoice('pause','少し距離を取り、伝言だけ預かる','費用なし。仲直りはゆっくりだが、追い詰めない。',{trust:3,relations:[['cat','sister',8]],residents:{cat:{stress:-4},sister:{stress:-4}}},'返事を急がせないでくれるなら、返事を考えられるニャ。'),
      caseChoice('blame','「兄なんだから」とモクに我慢を求める','表面上は収まる。気持ちの置き場所がなくなる。',{trust:-8,relations:[['cat','sister',-12]],residents:{cat:{stress:15}}},'年上だからって、気にしない機能がつくわけじゃないニャ。')
    ]
  },
  fridge: {
    title:'冷蔵庫消失事件。冷蔵庫は、そこにある。',cast:['fox','peko'],chain:true,
    detail:'ホロが買い置きの缶をゼリーに使おうとしたら、すべて消えていた。ペコは空き缶を、きれいに洗って並べている。',
    lines:[['fox','私の三日分が、空になってる。'],['peko','ゼリーなら、ごはんじゃないから。つい。'],['fox','じゃあ私の楽しみも、ごはんじゃないから返して。']],
    choices:[
      caseChoice('cook','二人で作り直し、材料費を半分補助する','費用二千円。買い置きの区分けも一緒にする。',{funds:-2000,trust:5,solidarity:2,relations:[['fox','peko',15]],scenes:{fox:'chat',peko:'eat'}},'ペコ、味見は一個ね。一個の意味から確認しよう。'),
      caseChoice('label','弁償は少しずつ。専用棚を分ける','費用五百円。関係より再発防止を優先する。',{funds:-500,safety:2,relations:[['fox','peko',3]],residents:{peko:{cash:-500}}},'棚を分けても、お腹は分けられないんだね。'),
      caseChoice('dismiss','「食べ物くらい」とホロに譲ってもらう','費用なし。食べ物より、気持ちの話が大きくなる。',{trust:-6,relations:[['fox','peko',-20]],residents:{fox:{stress:18}}},'くらい、って言われる物で、毎日を楽しみにしてるんだけど。')
    ]
  },
  night_talk: {
    title:'無料相談に、営業時間の概念がない。',cast:['hostess','ann'],chain:true,
    detail:'ルナとアンが夜の廊下で話している。高級品の送り主も、先延ばしの約束も、思ったより身近につながっていた。',
    lines:[['hostess','待ってる時間って、誰も時給払ってくれないね。'],['ann','私、もう「今度」って曜日がある気がしてきた。'],['hostess','その曜日、カレンダーから消したい。']],
    choices:[
      caseChoice('space','お茶と場所だけ用意し、秘密は二人に任せる','費用千円。聞き役を奪わず、交流を支える。',{funds:-1000,trust:7,solidarity:2,relations:[['hostess','ann',18]],scenes:{hostess:'counsel',ann:'chat'}},'お茶代だけなら安いね。相談料まで取ったら、私より商売上手。'),
      caseChoice('budget','二人が望むなら、独立資金の勉強会にする','費用二千円。仕事の種になるが、休む時間は減る。',{funds:-2000,solidarity:2,trust:5,relations:[['hostess','ann',10]]},'夢の前に、電卓。……電卓の電池代も入れとこ。',caseReport(36,'二人の小さな相談仕事、初めての依頼。','ルナが聞き、アンが文字にまとめた。お礼の一部は管理費へ、残りは二人の仕事の封筒へ入った。',{funds:7000,success:1,residents:{hostess:{cash:3000},ann:{cash:3000}}})),
      caseChoice('listen_in','内容が気になって、管理人も聞き込む','費用なし。二人の相談が、三人への説明になる。',{trust:-8,relations:[['hostess','ann',-4]],residents:{ann:{stress:7}}},'管理人さん、お茶の席と事情聴取の席、別にしよ。')
    ]
  },
  produce: {
    title:'地雷系プロデュース。予算が先に爆発する。',cast:['sister','hostess'],chain:true,
    detail:'ルナがネムの服を見て、撮影会を提案した。二人とも「手持ちで十分」と言いながら、新しい通販ページを開いている。',
    lines:[['hostess','似合うものと、買えるもの。今日は両方そろえよう。'],['sister','写真の背景、アパートは映さないよ。そこは学んだ。'],['hostess','あとはカートの金額だけ、現実に戻そ。']],
    choices:[
      caseChoice('closet','手持ちの服で、住所を隠して撮影する','費用五百円。二人の工夫で楽しむ。',{funds:-500,buzz:9,solidarity:2,trust:5,relations:[['sister','hostess',15]]},'新しい服じゃなくても、新しい私に見える。ルナさん、ありがとう。'),
      caseChoice('sponsor','撮影用の服を管理費で少し補助する','費用三千円。小さな仕事につながるかもしれない。',{funds:-3000,buzz:18,trust:4,relations:[['sister','hostess',10]]},'「管理人提供」って書いたら、家賃安く見える？',caseReport(24,'商店街から、撮影の仕事が一件。','新しい服より、二人の掛け合いが気に入られた。小さな報酬が次の撮影費になった。',{funds:5000,success:1,residents:{sister:{cash:1500},hostess:{cash:1500}}})),
      caseChoice('building','建物を背景にして、宣伝まで頼む','費用なし。生活の場所が再び見世物になる。',{buzz:24,safety:-9,trust:-5},'映さないって言った背景が、いちばん主役になってる。',caseReport(16,'写真の背景が、待ち合わせ場所になった。','玄関前で撮影する人が増えた。二人は服より先に、カーテンを選び始めた。',{safety:-5,allStress:6}))
    ]
  },
  jobs: {
    title:'家賃滞納パニック。求人票の「賄い」だけ蛍光色。',cast:['peko','hostess'],chain:true,
    detail:'ペコの仕事探しに住人が集まった。モクは「起きられない仕事」を消し、ホロは「飲めない仕事」を消している。残った紙が薄い。',
    lines:[['peko','みんな、私の仕事なのに条件が厳しい。'],['hostess','ペコの条件だけで選ぼ。賄いと、帰りの時間。'],['peko','あと、給料をその日に全部食べない仕組み。']],
    choices:[
      caseChoice('match','本人に合う賄い付き仕事と、家賃の取り分を決める','手配費千円。無理のない小さな収入を作る。',{funds:-1000,trust:7,solidarity:2,residents:{peko:{stress:-10}}},'ごはんも給料もある仕事、夢じゃなかった！',caseReport(24,'家賃の封筒から、ごはんの匂いがしなくなった。','ペコは臨時仕事を続け、封筒を先に分けた。食費用の封筒だけは、まだ少し薄い。',{funds:3600,residents:{peko:{cash:3000,debt:-1500}},success:1})),
      caseChoice('stall','みんなで一日だけ、屋台を手伝う','費用四千円。交流と売上はあるが、毎日はできない。',{funds:-4000,solidarity:3,buzz:12,allStress:-5},'味見担当は外されました。今日はお会計します。',caseReport(12,'売上表より、おかわりの列が長かった。','それでも少し黒字になった。住人は「また今度」と言い、アンはその言葉を電卓で割り引いた。',{funds:6500,residents:{peko:{cash:1800}},success:1})),
      caseChoice('wait','返済の約束だけ取り、来週まで待つ','今は費用なし。収入の方法はまだ決まらない。',{trust:1},'来週の私にも、求人票は渡しておきます。',caseReport(24,'求人票より先に、割引券が増えた。','収入は増えず、支払いの順番だけが後ろへずれた。',{funds:-2400,residents:{peko:{debt:2400,stress:8}}}))
    ]
  },
  roomshare: {
    title:'修繕は一部屋。困りごとは二部屋分。',cast:['cat','fox'],chain:true,
    detail:'修繕中のモクの休憩場所を、ホロの部屋で借りることになった。灰皿の置き場所と冷蔵庫の棚で、さっそく議論が始まる。',
    lines:[['cat','タバコは外で吸うから、缶を置く場所を貸してニャ。'],['fox','その缶、私の缶と似すぎ。名前、書いて。'],['cat','仮住まいより、仮のルールが必要だったニャ。']],
    choices:[
      caseChoice('rules','滞在時間・私物・片づけのルールを二人で決める','費用千二百円。短い同居にも境界を作る。',{funds:-1200,safety:5,trust:5,solidarity:2,relations:[['cat','fox',12]],scenes:{cat:'chat',fox:'chat'},visit:['cat','fox']},'名前を書いた缶は飲まない。書いてない缶も、聞いてからニャ。',caseReport(8,'壁紙が直る前に、缶のラベルがそろった。','二人は一緒にラベルを書いた。字が雑なほうの缶は、結局見分けづらい。',{safety:4,relations:[['cat','fox',5]]},'fridge')),
      caseChoice('hotel','管理費で別の休憩場所を借りる','費用七千円。住人の暮らしを乱さずに済む。',{funds:-7000,safety:5,trust:7,residents:{cat:{stress:-10},fox:{stress:-4}}},'きれいな部屋、何も置いてなくて落ち着かないニャ。ゴミは持ち帰るニャ。'),
      caseChoice('informal','二人に任せ、細かいことは決めない','今は費用なし。気楽さと無断使用は隣り合っている。',{trust:1,visit:['cat','fox'],scenes:{cat:'chat',fox:'chat'}},'気楽にしていいって言われたニャ。ホロの気楽と、同じ意味だといいニャ。',caseReport(8,'仮住まいの敷金は、冷蔵庫の中身だった。','缶の持ち主を巡って二人が口論。修繕業者は壁の向こうで、静かに見積もりを一枚増やした。',{funds:-3500,relations:[['cat','fox',-18]],allStress:5},'fridge'))
    ]
  }
};

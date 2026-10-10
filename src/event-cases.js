// Resident conflicts: stable case/choice IDs keep existing saves compatible.
export const MANAGEMENT_CASES = {
  "cigarette": {
    "title": "煙より先に、香水が着火した。",
    "cast": [
      "cat",
      "hostess"
    ],
    "day": 2,
    "detail": "ルナがモクの部屋の煙臭さに抗議。モクは廊下の香水を指摘し返す。焦げた座布団も見つかり、話は安全と生活の境界へ。",
    "lines": [
      [
        "hostess",
        "服に匂いがつくの。明日の仕事、あなたが接客する？"
      ],
      [
        "cat",
        "廊下を香水で占領してるのは誰だニャ。座布団の穴まで俺だけのせい？"
      ],
      [
        "manager",
        "匂いの話と、火の話を一緒にすると終わりません。"
      ],
      [
        "hostess",
        "なら私だけ我慢したことにはしないで。"
      ]
    ],
    "choices": [
      {
        "id": "check",
        "label": "二人で匂いの境界線を決める",
        "hint": "",
        "effects": {
          "funds": -2200,
          "safety": 7,
          "trust": 8,
          "residents": {
            "cat": {
              "stress": 3,
              "trash": -4
            }
          },
          "relations": [
            [
              "cat",
              "hostess",
              4
            ]
          ]
        },
        "reply": "灰皿をそこに置くなら、廊下の香水にも境界線を引くニャ。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：煙より先に、香水が着火した。",
          "text": "灰皿の場所は決まったが、ルナの香水の置き場までモクが指定し始めた。二人は廊下の端を互いの領土と呼んでいる。",
          "effects": {
            "safety": -2,
            "relations": [
              [
                "cat",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "灰皿をそこに置くなら、廊下の香水にも境界線を引くニャ。"
          ],
          [
            "hostess",
            "香水の場所も見直す。でも火の確認までおあいこにしないで。"
          ]
        ]
      },
      {
        "id": "inspect",
        "label": "修繕中の荷物を二人で分担する",
        "hint": "",
        "effects": {
          "funds": -6500,
          "safety": 17,
          "trust": -2,
          "repairs": 1,
          "relations": [
            [
              "cat",
              "hostess",
              2
            ]
          ]
        },
        "reply": "缶は捨てないニャ。空だけど、まだ使う予定があるニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：煙より先に、香水が着火した。",
          "text": "修繕で火の心配は減った。預かった荷物の缶を巡って、今度は別の部屋から苦情が来た。",
          "effects": {
            "safety": 2,
            "relations": [
              [
                "cat",
                "hostess",
                1
              ]
            ]
          },
          "next": "roomshare"
        },
        "replyLines": [
          [
            "cat",
            "缶は捨てないニャ。空だけど、まだ使う予定があるニャ。"
          ],
          [
            "hostess",
            "預かる物は先に教えて。匂いがつく物は困るわ。"
          ]
        ]
      },
      {
        "id": "leave",
        "label": "今日は別々にし、明日現場で話す",
        "hint": "",
        "effects": {
          "trust": 2,
          "relations": [
            [
              "cat",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "明日なら、どの匂いか二人で確認できるニャ。",
        "follow": {
          "delay": 6,
          "title": "仲裁のあと：煙より先に、香水が着火した。",
          "text": "別々にした夜、モクは確認を忘れた。壁紙の修繕で離れる期間が延び、ルナは「距離の取り方が高すぎる」と言った。",
          "effects": {
            "funds": -14000,
            "safety": -21,
            "trust": -9,
            "repairs": 1,
            "residents": {
              "cat": {
                "stress": 18
              }
            },
            "relations": [
              [
                "cat",
                "hostess",
                4
              ]
            ]
          },
          "next": "roomshare"
        },
        "replyLines": [
          [
            "cat",
            "明日なら、どの匂いか二人で確認できるニャ。"
          ],
          [
            "hostess",
            "明日の確認は約束ね。待った分だけ忘れたふりは許さないから。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "quit_smoking": {
    "title": "禁煙監督、妹。抗議窓口、兄。",
    "cast": [
      "cat",
      "sister"
    ],
    "day": 3,
    "requires": "cigarette",
    "detail": "ネムが禁煙の見張りを始めた。モクは監視されるほど吸いたくなると言い、ネムは隠れて吸った証拠を並べる。",
    "lines": [
      [
        "sister",
        "嘘ついてまで吸うなら、もう応援しない。"
      ],
      [
        "cat",
        "毎回報告するほうがタバコより息苦しいニャ。"
      ],
      [
        "manager",
        "減らしたい気持ちは、まだ二人ともありますか？"
      ],
      [
        "sister",
        "減らしてほしい。でも私だけ悪役なのは嫌。"
      ]
    ],
    "choices": [
      {
        "id": "gradual",
        "label": "本数ではなく、報告する時刻を決める",
        "hint": "",
        "effects": {
          "trust": 7,
          "funds": -500,
          "residents": {
            "cat": {
              "stress": -6
            }
          },
          "relations": [
            [
              "cat",
              "sister",
              4
            ]
          ]
        },
        "reply": "一日一回なら報告するニャ。一本ごとの点呼はなしだニャ。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：禁煙監督、妹。抗議窓口、兄。",
          "text": "報告が一日一回になりモクは続けられた。ただしネムはその時刻まで心配し、兄は報告のために起きるようになった。",
          "effects": {
            "safety": 5,
            "solidarity": 1,
            "residents": {
              "cat": {
                "cash": 1200,
                "trash": -10
              }
            },
            "relations": [
              [
                "cat",
                "sister",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "一日一回なら報告するニャ。一本ごとの点呼はなしだニャ。"
          ],
          [
            "sister",
            "点呼はやめる。その代わり、報告の時まで隠さないで。"
          ]
        ]
      },
      {
        "id": "pledge",
        "label": "兄妹で互いのやめたい習慣を宣言する",
        "hint": "",
        "effects": {
          "trust": -3,
          "buzz": 4,
          "residents": {
            "cat": {
              "stress": 15
            }
          },
          "relations": [
            [
              "cat",
              "sister",
              2
            ]
          ]
        },
        "reply": "妹の夜更かしも数えるのかニャ。それなら俺も監督だニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：禁煙監督、妹。抗議窓口、兄。",
          "text": "兄の禁煙と妹の夜更かしが相互監査になった。二人とも少し改善したが、廊下での点呼がうるさい。",
          "effects": {
            "allStress": 8,
            "trust": -4,
            "relations": [
              [
                "cat",
                "sister",
                -12
              ],
              [
                "cat",
                "sister",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "妹の夜更かしも数えるのかニャ。それなら俺も監督だニャ。"
          ],
          [
            "sister",
            "私の方も書く。兄が吸ったから私も夜更かししていい、にはしない。"
          ]
        ]
      },
      {
        "id": "no_pressure",
        "label": "妹は監督を休み、兄に記録を任せる",
        "hint": "",
        "effects": {
          "funds": -1000,
          "safety": 4,
          "trust": 3,
          "relations": [
            [
              "cat",
              "sister",
              -2
            ]
          ]
        },
        "reply": "見張られなくても記録はつけるニャ。毎日同じでも笑うなニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：禁煙監督、妹。抗議窓口、兄。",
          "text": "監視がなくなって喧嘩は止まった。モクの記録には「昨日と同じ」が並び、ネムはそれでも口を挟まず待っている。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "見張られなくても記録はつけるニャ。毎日同じでも笑うなニャ。"
          ],
          [
            "sister",
            "口は出さない。手伝ってほしい時は兄から言って。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "collection": {
    "title": "捨てたらゴミ、戻したら家族喧嘩。",
    "cast": [
      "cat",
      "sister"
    ],
    "day": 4,
    "detail": "ネムが掃除した棚を、モクが元に戻した。限定皿の箱まで捨てたかどうかで、二人の記憶が食い違う。",
    "lines": [
      [
        "sister",
        "箱、もう使わないって言ったじゃん。"
      ],
      [
        "cat",
        "使わないと捨てていいは別だニャ。皿より箱が大事なんだニャ。"
      ],
      [
        "manager",
        "片づける範囲から決め直しましょう。"
      ],
      [
        "sister",
        "じゃあ私が掃除した時間は何だったの？"
      ]
    ],
    "choices": [
      {
        "id": "ask",
        "label": "触らない棚と、片づける棚を分ける",
        "hint": "",
        "effects": {
          "trust": 7,
          "solidarity": 1,
          "relations": [
            [
              "cat",
              "sister",
              8
            ]
          ],
          "residents": {
            "cat": {
              "trash": -16
            }
          }
        },
        "reply": "この棚だけは、掃除機より俺の許可が先だニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：捨てたらゴミ、戻したら家族喧嘩。",
          "text": "触らない棚だけが満杯になった。掃除は進んだが、モクは棚を増やす案を提出し、ネムが却下した。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "この棚だけは、掃除機より俺の許可が先だニャ。"
          ],
          [
            "sister",
            "棚を増やすのはなしね。部屋全部が触らない棚になっちゃう。"
          ]
        ]
      },
      {
        "id": "auction",
        "label": "二人で箱の値段を調べてから整理する",
        "hint": "",
        "effects": {
          "funds": 2500,
          "trust": 2,
          "residents": {
            "cat": {
              "stress": 6,
              "trash": -18
            }
          },
          "relations": [
            [
              "cat",
              "sister",
              2
            ]
          ]
        },
        "reply": "箱の値段を見たら、捨てる前に止まってくれると思うニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：捨てたらゴミ、戻したら家族喧嘩。",
          "text": "値段を調べるうちに二人で箱を売った。モクは後で一箱だけ買い戻し、ネムはその差額を「授業料」と呼んだ。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "箱の値段を見たら、捨てる前に止まってくれると思うニャ。"
          ],
          [
            "sister",
            "値段を見てから決めよう。高いから全部残す、とは言ってないよ。"
          ]
        ]
      },
      {
        "id": "post",
        "label": "捨てた箱の話より、掃除の分担を先にする",
        "hint": "",
        "effects": {
          "buzz": 15,
          "trust": -8,
          "relations": [
            [
              "cat",
              "sister",
              -15
            ]
          ]
        },
        "reply": "分担を決めるなら、勝手に開ける引き出しはなくなるニャ？",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：捨てたらゴミ、戻したら家族喧嘩。",
          "text": "掃除の分担は決まったが、捨てた箱の話は残った。ネムが愚痴を投稿すると近所で話題になり、兄の無言が長くなった。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                4
              ]
            ]
          },
          "next": "siblings"
        },
        "replyLines": [
          [
            "cat",
            "分担を決めるなら、勝手に開ける引き出しはなくなるニャ？"
          ],
          [
            "sister",
            "私も分担は守る。捨てた箱のことは後でちゃんと話したい。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "karaoke": {
    "title": "拍手だと思ったら、壁が怒っていた。",
    "cast": [
      "fox",
      "ann"
    ],
    "day": 3,
    "detail": "ホロの深夜カラオケにアンが抗議。ホロはアンの深夜の来客も眠れない原因だと言い返した。",
    "lines": [
      [
        "ann",
        "歌で起こされたの。仕事があるのは私だけじゃないでしょう。"
      ],
      [
        "fox",
        "そっちのドアの音も聞こえるよ。私だけ夜を取り上げられるの？"
      ],
      [
        "manager",
        "音の種類より、眠れる時間を決めませんか。"
      ],
      [
        "ann",
        "来客まで歌と一緒にされたくない。"
      ]
    ],
    "choices": [
      {
        "id": "headphones",
        "label": "今夜だけ静かにし、朝に二人で確認する",
        "hint": "",
        "effects": {
          "funds": -1800,
          "trust": 5,
          "allStress": -5,
          "relations": [
            [
              "fox",
              "ann",
              4
            ]
          ]
        },
        "reply": "朝の話し合い、起きられる時間にしてね。",
        "follow": {
          "delay": 6,
          "title": "仲裁のあと：拍手だと思ったら、壁が怒っていた。",
          "text": "今夜は静かになった。朝の確認でホロが寝坊し、アンは待ち時間の分だけ腹を立てた。",
          "effects": {
            "safety": 1,
            "allStress": -3,
            "relations": [
              [
                "fox",
                "ann",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "朝の話し合い、起きられる時間にしてね。"
          ],
          [
            "ann",
            "朝まで待つ。話し合いに寝坊したらドアは叩くわよ。"
          ]
        ]
      },
      {
        "id": "daytime",
        "label": "二人の夜の予定を交換して時間をずらす",
        "hint": "",
        "effects": {
          "funds": -2500,
          "solidarity": 2,
          "allStress": -8,
          "buzz": 7,
          "relations": [
            [
              "fox",
              "peko",
              7
            ],
            [
              "fox",
              "ann",
              2
            ]
          ]
        },
        "reply": "そっちが外出する時間なら、少し歌ってもいいってこと？",
        "follow": {
          "delay": 16,
          "title": "仲裁のあと：拍手だと思ったら、壁が怒っていた。",
          "text": "予定を交換した二人は同じ夜に外へ出た。睡眠は守れたが、今度は帰宅した二人の雑談が長くなった。",
          "effects": {
            "solidarity": 1,
            "relations": [
              [
                "fox",
                "ann",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "そっちが外出する時間なら、少し歌ってもいいってこと？"
          ],
          [
            "ann",
            "予定は渡す。空いた時間全部が歌の時間になるのは違うから。"
          ]
        ]
      },
      {
        "id": "fine",
        "label": "声ではなく、廊下に聞こえる音を基準にする",
        "hint": "",
        "effects": {
          "trust": -6,
          "allStress": -3,
          "residents": {
            "fox": {
              "stress": 14
            }
          },
          "relations": [
            [
              "fox",
              "ann",
              -2
            ]
          ]
        },
        "reply": "ため息も音に入る？　歌より多くなりそうだけど。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：拍手だと思ったら、壁が怒っていた。",
          "text": "貼り紙は「音の種類を問わず」に変わった。アンも来客の足音を抑え、ホロは歌を止めたが、二人は互いの物音に敏感になった。",
          "effects": {
            "relations": [
              [
                "fox",
                "ann",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "ため息も音に入る？　歌より多くなりそうだけど。"
          ],
          [
            "ann",
            "来客の足音も抑える。ため息を数えるほど暇じゃないわ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "wrong_room": {
    "title": "模様替えの作者と、部屋の持ち主。",
    "cast": [
      "fox",
      "hostess"
    ],
    "day": 4,
    "detail": "酔ったホロがルナの部屋を自室と間違え、棚を動かした。ルナは配置より、勝手に触られたことに怒っている。",
    "lines": [
      [
        "hostess",
        "戻せば終わり？　どこまで見たの？"
      ],
      [
        "fox",
        "見てないよ。棚の裏のレシートは見えちゃったけど。"
      ],
      [
        "manager",
        "元に戻す人と、確認する人を分けましょう。"
      ],
      [
        "hostess",
        "管理人さんまで部屋に入るの？"
      ]
    ],
    "choices": [
      {
        "id": "restore",
        "label": "ルナの指示でホロが配置を戻す",
        "hint": "",
        "effects": {
          "funds": -600,
          "trust": 5,
          "solidarity": 1,
          "residents": {
            "fox": {
              "trash": -8
            }
          },
          "relations": [
            [
              "fox",
              "hostess",
              4
            ]
          ]
        },
        "reply": "棚の位置、教えて。今度は勝手に左右対称にしないから。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：模様替えの作者と、部屋の持ち主。",
          "text": "ルナの指示で棚が戻った。ホロは置き場所を全部覚え、ルナは「覚えなくていい」と再び不安になった。",
          "effects": {
            "relations": [
              [
                "fox",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "棚の位置、教えて。今度は勝手に左右対称にしないから。"
          ],
          [
            "hostess",
            "指示するから触った物は戻して。私の部屋の研究はしないでね。"
          ]
        ]
      },
      {
        "id": "compensate",
        "label": "今日は管理人が片づけ、二人は離す",
        "hint": "",
        "effects": {
          "funds": -3500,
          "allStress": -5,
          "trust": 2,
          "relations": [
            [
              "fox",
              "hostess",
              2
            ]
          ]
        },
        "reply": "今日は離れるよ。でも謝るのまで管理人に任せた覚えはないよ。",
        "follow": {
          "delay": 18,
          "title": "仲裁のあと：模様替えの作者と、部屋の持ち主。",
          "text": "片づけは終わったが、ホロは謝る機会を逃した。ルナの礼は管理人にだけ向いた。",
          "effects": {
            "trust": -3,
            "relations": [
              [
                "fox",
                "hostess",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "今日は離れるよ。でも謝るのまで管理人に任せた覚えはないよ。"
          ],
          [
            "hostess",
            "今日は離れたい。明日、あなたの言葉で聞かせて。"
          ]
        ]
      },
      {
        "id": "exhibit",
        "label": "触った物を二人で一つずつ確認する",
        "hint": "",
        "effects": {
          "buzz": 14,
          "trust": -9,
          "allStress": 9,
          "relations": [
            [
              "fox",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "触った物を全部？　缶の位置も一個ずつ数える？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：模様替えの作者と、部屋の持ち主。",
          "text": "触った物の一覧を作る途中でルナの買い物履歴まで話題になり、バッグより秘密の管理が忙しくなった。",
          "effects": {
            "relations": [
              [
                "fox",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "触った物を全部？　缶の位置も一個ずつ数える？"
          ],
          [
            "hostess",
            "一個ずつ確認する。大げさだって笑うならやめるわ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "sober": {
    "title": "禁酒会の差し入れが、酒のつまみ。",
    "cast": [
      "fox",
      "peko"
    ],
    "day": 5,
    "requires": "karaoke",
    "detail": "ペコが禁酒中のホロへ大量のつまみを差し入れた。ホロは誘惑だと怒り、ペコはお礼もないと腹を立てる。",
    "lines": [
      [
        "peko",
        "応援したら怒られたんですけど。食べ物に罪ないですよね？"
      ],
      [
        "fox",
        "この塩気で水飲めって？　応援の顔した試験だよ。"
      ],
      [
        "manager",
        "差し入れをどう受け取るか、決め直しましょう。"
      ],
      [
        "peko",
        "捨てるくらいなら私が全部食べます。"
      ]
    ],
    "choices": [
      {
        "id": "tea",
        "label": "差し入れを朝食に変えて二人で食べる",
        "hint": "",
        "effects": {
          "funds": -2400,
          "solidarity": 2,
          "trust": 6,
          "residents": {
            "fox": {
              "stress": -12
            }
          },
          "relations": [
            [
              "fox",
              "peko",
              4
            ]
          ]
        },
        "reply": "朝ならこの塩気でも、お酒じゃなくてご飯がほしくなるかな。",
        "follow": {
          "delay": 72,
          "title": "仲裁のあと：禁酒会の差し入れが、酒のつまみ。",
          "text": "二人の朝食会が続いた。禁酒は進んだがペコの朝食の量にホロが悲鳴を上げた。",
          "effects": {
            "solidarity": 2,
            "residents": {
              "fox": {
                "cash": 1800,
                "stress": -10
              }
            },
            "relations": [
              [
                "fox",
                "peko",
                -3
              ]
            ]
          },
          "next": "fridge"
        },
        "replyLines": [
          [
            "fox",
            "朝ならこの塩気でも、お酒じゃなくてご飯がほしくなるかな。"
          ],
          [
            "peko",
            "朝ご飯は任せてください。お酒の代わりに食費が増えても知りませんよ。"
          ]
        ]
      },
      {
        "id": "deposit",
        "label": "禁酒の約束を二人の共同企画にする",
        "hint": "",
        "effects": {
          "trust": 2,
          "residents": {
            "fox": {
              "stress": 6
            }
          },
          "relations": [
            [
              "fox",
              "peko",
              2
            ]
          ]
        },
        "reply": "失敗した日も報告する企画ならやる。成功した日だけの写真は嫌。",
        "follow": {
          "delay": 72,
          "title": "仲裁のあと：禁酒会の差し入れが、酒のつまみ。",
          "text": "共同企画の成功報告がプレッシャーになった。ホロは失敗を隠し、ペコは気づいても尋ねられなかった。",
          "effects": {
            "residents": {
              "fox": {
                "cash": 900
              }
            },
            "trust": 2,
            "relations": [
              [
                "fox",
                "peko",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "失敗した日も報告する企画ならやる。成功した日だけの写真は嫌。"
          ],
          [
            "peko",
            "失敗の日もご飯は出します。応援まで取り上げたくないので。"
          ]
        ]
      },
      {
        "id": "cheer",
        "label": "差し入れは受け取り、食べる日は別にする",
        "hint": "",
        "effects": {
          "trust": 3,
          "relations": [
            [
              "fox",
              "peko",
              -2
            ]
          ]
        },
        "reply": "差し入れは受け取るよ。今食べないからって怒らないでね。",
        "follow": {
          "delay": 48,
          "title": "仲裁のあと：禁酒会の差し入れが、酒のつまみ。",
          "text": "差し入れは後日に回った。ホロは一人で我慢できた日もあったが、ペコは誘う時期を失った。",
          "effects": {
            "residents": {
              "fox": {
                "stress": 4
              }
            },
            "trust": 1,
            "relations": [
              [
                "fox",
                "peko",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "差し入れは受け取るよ。今食べないからって怒らないでね。"
          ],
          [
            "peko",
            "食べる日は決めましょう。ずっと残ると私が食べちゃうので。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "gift": {
    "title": "贈り物より、宛名のほうが高くつく。",
    "cast": [
      "hostess",
      "ann"
    ],
    "day": 3,
    "detail": "ルナに届いた高級品を見て、アンが贈り主に心当たりがあると言う。ルナは詮索を嫌がり、アンは住所を使われたと疑う。",
    "lines": [
      [
        "ann",
        "それ、私に渡すって言っていた物と同じ。"
      ],
      [
        "hostess",
        "私が奪ったみたいな言い方、やめて。送り状は私の名前よ。"
      ],
      [
        "manager",
        "品物の持ち主と、事情を聞く相手は別です。"
      ],
      [
        "ann",
        "確かめる間、誰が持っているの？"
      ]
    ],
    "choices": [
      {
        "id": "confirm",
        "label": "開けずに管理人が一晩預かる",
        "hint": "",
        "effects": {
          "funds": -800,
          "trust": 7,
          "relations": [
            [
              "hostess",
              "ann",
              4
            ]
          ]
        },
        "reply": "一晩だけなら預ける。私の物じゃないと決まったわけじゃないから。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：贈り物より、宛名のほうが高くつく。",
          "text": "預かった箱の保管で管理人室が狭くなった。二人は争わずに済んだが、徳蔵が別の箱を持って現れた。",
          "effects": {
            "relations": [
              [
                "hostess",
                "ann",
                -3
              ]
            ]
          },
          "next": "night_talk"
        },
        "replyLines": [
          [
            "hostess",
            "一晩だけなら預ける。私の物じゃないと決まったわけじゃないから。"
          ],
          [
            "ann",
            "預ける間に私物扱いしないで。それだけは約束して。"
          ]
        ]
      },
      {
        "id": "return",
        "label": "送り状を二人で確認してから受取人へ返す",
        "hint": "",
        "effects": {
          "funds": -1200,
          "trust": 4,
          "residents": {
            "hostess": {
              "stress": 4
            }
          },
          "relations": [
            [
              "hostess",
              "ann",
              2
            ]
          ]
        },
        "reply": "宛名から確認して。人の顔色で決めないでね。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：贈り物より、宛名のほうが高くつく。",
          "text": "送り状の確認で誤配送が分かった。疑われたルナと疑ってしまったアンは、気まずい夜食を一緒に食べた。",
          "effects": {
            "relations": [
              [
                "hostess",
                "ann",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "宛名から確認して。人の顔色で決めないでね。"
          ],
          [
            "ann",
            "送り状からね。私が疑った理由も後で聞いてほしい。"
          ]
        ]
      },
      {
        "id": "display",
        "label": "品物は動かさず、贈り主への質問を揃える",
        "hint": "",
        "effects": {
          "buzz": 12,
          "trust": -5,
          "allStress": 4,
          "relations": [
            [
              "hostess",
              "ann",
              -2
            ]
          ]
        },
        "reply": "質問を揃えるのはいいわ。でも彼の返事を信じるかは別よ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：贈り物より、宛名のほうが高くつく。",
          "text": "質問を揃えた二人は同じ返事を受け取った。「どちらにも似合う」。贈り物より返事のコピーの方が問題になった。",
          "effects": {
            "relations": [
              [
                "hostess",
                "ann",
                -10
              ],
              [
                "hostess",
                "ann",
                4
              ]
            ]
          },
          "next": "night_talk"
        },
        "replyLines": [
          [
            "hostess",
            "質問を揃えるのはいいわ。でも彼の返事を信じるかは別よ。"
          ],
          [
            "ann",
            "返事を見てから考える。二人で同じ結論にする必要はないと思う。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "missing_bag": {
    "title": "捜索会議が、取り調べになった。",
    "cast": [
      "hostess",
      "sister"
    ],
    "day": 5,
    "requires": "gift",
    "detail": "ルナのバッグが消えた。ネムの配信に似たバッグが映り、ルナが問い詰める。ネムは画面だけで決めるなと怒る。",
    "lines": [
      [
        "sister",
        "それ限定色なの。偶然で片づけないで。"
      ],
      [
        "hostess",
        "同じ物持ってたら泥棒？　買った証拠出すまで帰れないの？"
      ],
      [
        "manager",
        "見た時刻と、なくなった時刻を分けて話しましょう。"
      ],
      [
        "sister",
        "疑ったことはなかったことにしないで。"
      ]
    ],
    "choices": [
      {
        "id": "search",
        "label": "二人で最後に見た場所をたどる",
        "hint": "",
        "effects": {
          "trust": 7,
          "solidarity": 1,
          "relations": [
            [
              "hostess",
              "sister",
              4
            ]
          ]
        },
        "reply": "最後に見た棚からね。探す途中で別の物まで品評しないで。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：捜索会議が、取り調べになった。",
          "text": "二人で探したバッグは共用棚にあった。疑いは晴れたが、ネムは探す間に言われた一言を覚えていた。",
          "effects": {
            "allStress": -3,
            "relations": [
              [
                "hostess",
                "sister",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "最後に見た棚からね。探す途中で別の物まで品評しないで。"
          ],
          [
            "sister",
            "探すのは手伝う。私の持ち物は捜索対象じゃないからね。"
          ]
        ]
      },
      {
        "id": "notice",
        "label": "持ち物の写真を管理人だけが確認する",
        "hint": "",
        "effects": {
          "funds": -300,
          "trust": 3,
          "solidarity": 2,
          "relations": [
            [
              "hostess",
              "sister",
              2
            ]
          ]
        },
        "reply": "写真は管理人さんだけに見せる。噂の材料を増やしたくないの。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：捜索会議が、取り調べになった。",
          "text": "証拠を非公開にしたため廊下の噂は止まらなかった。二人は管理人の説明を待ち、勝手な投稿は控えた。",
          "effects": {
            "relations": [
              [
                "hostess",
                "sister",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "写真は管理人さんだけに見せる。噂の材料を増やしたくないの。"
          ],
          [
            "sister",
            "管理人だけなら見せる。確認が済んだら疑いも止めて。"
          ]
        ]
      },
      {
        "id": "accuse",
        "label": "まず似たバッグを並べて違いを探す",
        "hint": "",
        "effects": {
          "trust": -12,
          "allStress": 15,
          "relations": [
            [
              "hostess",
              "peko",
              -14
            ],
            [
              "hostess",
              "sister",
              -10
            ]
          ]
        },
        "reply": "並べるなら傷まで見て。似てるだけで片づけたくないわ。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：捜索会議が、取り調べになった。",
          "text": "バッグを並べると違う品だった。ルナは謝ったが、ネムの方が安く見えると口にして喧嘩を追加した。",
          "effects": {
            "trust": -4,
            "allStress": 4,
            "relations": [
              [
                "hostess",
                "sister",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "並べるなら傷まで見て。似てるだけで片づけたくないわ。"
          ],
          [
            "sister",
            "違いを見よう。値段の高い方が偉いって話はしないで。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "address": {
    "title": "ファンより先に、隣人が押しかけた。",
    "cast": [
      "hostess",
      "cat"
    ],
    "day": 6,
    "detail": "ルナの投稿から建物が特定された。モクはファンの声で眠れず、ルナはモクが窓から煽ったせいだと責める。",
    "lines": [
      [
        "cat",
        "窓から手を振らないでって言ったでしょ。"
      ],
      [
        "cat",
        "帰れって振ったニャ。投げキッスに見えたのは向こうの問題ニャ。"
      ],
      [
        "manager",
        "投稿と窓の対応を、一緒に見直しましょう。"
      ],
      [
        "cat",
        "私だけ全部消す話なら納得しない。"
      ]
    ],
    "choices": [
      {
        "id": "privacy",
        "label": "投稿を一晩止め、モクは窓を閉める",
        "hint": "",
        "effects": {
          "funds": -4000,
          "safety": 12,
          "trust": 8,
          "buzz": -10,
          "relations": [
            [
              "hostess",
              "cat",
              4
            ]
          ]
        },
        "reply": "今夜は投稿を止める。でも仕事への影響まで私だけで引き受けないわよ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：ファンより先に、隣人が押しかけた。",
          "text": "投稿を休む間に訪問は減った。モクは静かに眠れたが、ルナは仕事の宣伝も止まったと不満を伝えた。",
          "effects": {
            "relations": [
              [
                "hostess",
                "cat",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "今夜は投稿を止める。でも仕事への影響まで私だけで引き受けないわよ。"
          ],
          [
            "cat",
            "窓は閉めるニャ。俺まで宣伝係にしないでほしいニャ。"
          ]
        ]
      },
      {
        "id": "public_place",
        "label": "二人の連名で訪問を断る掲示を出す",
        "hint": "",
        "effects": {
          "funds": -6500,
          "safety": 7,
          "buzz": 18,
          "trust": 5,
          "relations": [
            [
              "hostess",
              "cat",
              2
            ]
          ]
        },
        "reply": "連名ならいいわ。モクも窓から手を振らないでね。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：ファンより先に、隣人が押しかけた。",
          "text": "連名の掲示は拡散され、二人の組み合わせまで人気になった。訪問は減ったのにネットの騒ぎは増えた。",
          "effects": {
            "solidarity": 1,
            "relations": [
              [
                "hostess",
                "cat",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "連名ならいいわ。モクも窓から手を振らないでね。"
          ],
          [
            "cat",
            "名前は貸すニャ。掲示の写真に俺の寝顔は使うなニャ。"
          ]
        ]
      },
      {
        "id": "viral",
        "label": "訪問時間を管理人が受け持ち、二人は出ない",
        "hint": "",
        "effects": {
          "buzz": 30,
          "trust": -4,
          "safety": -12,
          "relations": [
            [
              "hostess",
              "cat",
              -2
            ]
          ]
        },
        "reply": "受付を作るってこと？　来ていい場所だと思われない？",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：ファンより先に、隣人が押しかけた。",
          "text": "管理人が対応して住人は静かに暮らせた。来訪者は受付のある施設だと思い、問い合わせが積み上がった。",
          "effects": {
            "funds": 6000,
            "buzz": 8,
            "safety": -7,
            "allStress": 7,
            "relations": [
              [
                "hostess",
                "cat",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "受付を作るってこと？　来ていい場所だと思われない？"
          ],
          [
            "cat",
            "対応は任せるニャ。静かになったら起こさなくていいニャ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "expose": {
    "title": "身内ネタの出演料は、絶縁。",
    "cast": [
      "sister",
      "cat"
    ],
    "day": 5,
    "detail": "ネムが兄の生活を配信のネタにした。モクは削除を求めるが、ネムは以前笑っていたのにと反論する。",
    "lines": [
      [
        "cat",
        "笑ってたじゃん。今さら嫌って言われても。"
      ],
      [
        "cat",
        "妹に見せた顔と、知らない百人に見せる顔は違うニャ。"
      ],
      [
        "manager",
        "笑った時のことと、今困っていることを聞きましょう。"
      ],
      [
        "cat",
        "私だけ嘘つきみたいになってる。"
      ]
    ],
    "choices": [
      {
        "id": "agree",
        "label": "投稿を下げてから、残したい部分を話す",
        "hint": "",
        "effects": {
          "trust": 6,
          "solidarity": 1,
          "relations": [
            [
              "cat",
              "sister",
              10
            ]
          ],
          "buzz": 5
        },
        "reply": "下げるのはいい。でも私だけ悪意があったって書かないで。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：身内ネタの出演料は、絶縁。",
          "text": "公開は止まった。兄は安心したが、ネムは謝罪の投稿だけを求められ、次の文章を書けなくなった。",
          "effects": {
            "relations": [
              [
                "sister",
                "cat",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "下げるのはいい。でも私だけ悪意があったって書かないで。"
          ],
          [
            "cat",
            "下げたことは受け取るニャ。妹が悪いだけの文も要らないニャ。"
          ]
        ]
      },
      {
        "id": "private",
        "label": "兄にも説明文を書いてもらう",
        "hint": "",
        "effects": {
          "trust": 2,
          "buzz": 7,
          "relations": [
            [
              "cat",
              "sister",
              -3
            ]
          ]
        },
        "reply": "お兄ちゃんにも書いてもらう。私の文章ばっかり責めないで。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：身内ネタの出演料は、絶縁。",
          "text": "兄の説明は長すぎて別の話題になった。ネムは短く直したが、兄はまた勝手に直したと怒った。",
          "effects": {
            "relations": [
              [
                "sister",
                "cat",
                1
              ]
            ]
          },
          "next": "siblings"
        },
        "replyLines": [
          [
            "sister",
            "お兄ちゃんにも書いてもらう。私の文章ばっかり責めないで。"
          ],
          [
            "cat",
            "自分でも書くニャ。短くする時は一声かけてほしいニャ。"
          ]
        ]
      },
      {
        "id": "encourage",
        "label": "二人だけで見返して公開範囲を決める",
        "hint": "",
        "effects": {
          "buzz": 22,
          "trust": -10,
          "relations": [
            [
              "cat",
              "sister",
              -20
            ]
          ]
        },
        "reply": "公開する前に二人で見る。それなら途中で止めてもいい？",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：身内ネタの出演料は、絶縁。",
          "text": "二人のメモには違う困り事が書かれていた。すぐには仲直りしなかったが、次に何を聞くべきかは分かった。",
          "effects": {
            "relations": [
              [
                "sister",
                "cat",
                4
              ]
            ]
          },
          "next": "siblings"
        },
        "replyLines": [
          [
            "sister",
            "公開する前に二人で見る。それなら途中で止めてもいい？"
          ],
          [
            "cat",
            "二人で見るニャ。俺が止めたら、止めた顔も撮らないでほしいニャ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "limited": {
    "title": "限定グッズ、無制限の立替。",
    "cast": [
      "sister",
      "peko"
    ],
    "day": 5,
    "detail": "ネムに貸したお金が限定グッズに変わったとペコが怒る。ネムは返すつもりだったのに廊下で言うなと反発。",
    "lines": [
      [
        "peko",
        "私の食費なんです。返す予定でお腹は膨れません。"
      ],
      [
        "sister",
        "みんなの前で言わなくてもいいじゃん。逃げてないし。"
      ],
      [
        "manager",
        "今日必要なお金と、返す約束を分けましょう。"
      ],
      [
        "peko",
        "グッズを売れって言う前に話聞いて。"
      ]
    ],
    "choices": [
      {
        "id": "budget",
        "label": "今日の食費だけ先に返し、残りを分割する",
        "hint": "",
        "effects": {
          "trust": 5,
          "residents": {
            "sister": {
              "stress": 4
            }
          },
          "relations": [
            [
              "sister",
              "peko",
              4
            ]
          ]
        },
        "reply": "今日の食費は先に返す。残りまで今夜一括は無理だから。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：限定グッズ、無制限の立替。",
          "text": "食費を返してペコは今日を乗り切った。返済を続けるネムは遊びの誘いを断り、二人の会話も減った。",
          "effects": {
            "trust": 2,
            "relations": [
              [
                "sister",
                "peko",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "今日の食費は先に返す。残りまで今夜一括は無理だから。"
          ],
          [
            "peko",
            "今日の食費は助かります。残りも日付だけは決めてください。"
          ]
        ]
      },
      {
        "id": "advance",
        "label": "グッズは預け、二人で返済日を決める",
        "hint": "",
        "effects": {
          "funds": -4000,
          "trust": 7,
          "relations": [
            [
              "sister",
              "peko",
              2
            ]
          ]
        },
        "reply": "預けるけど、箱は開けないで。戻る時に傷があったら泣く。",
        "follow": {
          "delay": 48,
          "title": "仲裁のあと：限定グッズ、無制限の立替。",
          "text": "グッズを預けた約束は守られた。ペコは箱の保管を頼まれ、担保の方が部屋を占領した。",
          "effects": {
            "funds": 2500,
            "trust": 2,
            "relations": [
              [
                "sister",
                "peko",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "預けるけど、箱は開けないで。戻る時に傷があったら泣く。"
          ],
          [
            "peko",
            "箱は開けません。でも置く場所を私が用意するんですか？"
          ]
        ]
      },
      {
        "id": "allow",
        "label": "ネムの手伝い代をペコへの返済に回す",
        "hint": "",
        "effects": {
          "funds": -2400,
          "trust": 3,
          "residents": {
            "sister": {
              "debt": 2400
            }
          },
          "relations": [
            [
              "sister",
              "peko",
              -2
            ]
          ]
        },
        "reply": "手伝う。でも一時間いくら返したことになるか先に決めたい。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：限定グッズ、無制限の立替。",
          "text": "手伝いは始まったが、ペコが食事をお礼に出したため返済が進まない。二人は請求の意味を相談し直した。",
          "effects": {
            "allStress": 3,
            "trust": -3,
            "relations": [
              [
                "sister",
                "peko",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "手伝う。でも一時間いくら返したことになるか先に決めたい。"
          ],
          [
            "peko",
            "時給は先に決めましょう。ご飯のお礼と相殺したら終わらないので。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "insinuation": {
    "title": "匂わせたのは、香水だけだった。",
    "cast": [
      "sister",
      "hostess"
    ],
    "day": 6,
    "detail": "ネムの写真にルナのアクセサリーが映り、恋愛の噂が広まった。ルナは仕事相手から確認され、ネムは勝手な想像だと怒る。",
    "lines": [
      [
        "hostess",
        "仕事の連絡が全部その質問になったの。"
      ],
      [
        "sister",
        "アクセ借りたら恋愛になるって誰が決めたの？"
      ],
      [
        "manager",
        "何を説明して、何を説明しないか決めましょう。"
      ],
      [
        "hostess",
        "否定のために私の私生活まで出すの？"
      ]
    ],
    "choices": [
      {
        "id": "quiet",
        "label": "借り物だったことだけ二人で伝える",
        "hint": "",
        "effects": {
          "trust": 6,
          "buzz": -4,
          "allStress": -3,
          "relations": [
            [
              "sister",
              "hostess",
              4
            ]
          ]
        },
        "reply": "借りたって書く。それ以上のことまで答える約束はしないよ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：匂わせたのは、香水だけだった。",
          "text": "借り物だと説明すると、今度は二人の仲を詮索された。仕事の誤解は解けたが、ネムの通知は増えた。",
          "effects": {
            "relations": [
              [
                "sister",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "借りたって書く。それ以上のことまで答える約束はしないよ。"
          ],
          [
            "hostess",
            "借り物とだけ書いて。仕事相手への説明は私からするわ。"
          ]
        ]
      },
      {
        "id": "luna",
        "label": "投稿を残し、質問の窓口を一本にする",
        "hint": "",
        "effects": {
          "trust": 4,
          "solidarity": 1,
          "relations": [
            [
              "sister",
              "hostess",
              7
            ]
          ]
        },
        "reply": "窓口一本なら投稿は残せる？　写真そのものは気に入ってる。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：匂わせたのは、香水だけだった。",
          "text": "窓口を一本にして住人は楽になった。その窓口に恋愛相談まで届き、管理人が一番噂に詳しくなった。",
          "effects": {
            "relations": [
              [
                "sister",
                "hostess",
                1
              ]
            ]
          },
          "next": "produce"
        },
        "replyLines": [
          [
            "sister",
            "窓口一本なら投稿は残せる？　写真そのものは気に入ってる。"
          ],
          [
            "hostess",
            "質問はまとめる。あなたを勝手に代弁するつもりはないわ。"
          ]
        ]
      },
      {
        "id": "guess",
        "label": "説明はせず、今後の貸し借りを止める",
        "hint": "",
        "effects": {
          "buzz": 13,
          "trust": -7,
          "residents": {
            "sister": {
              "stress": 14
            }
          },
          "relations": [
            [
              "sister",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "もう借りないって、私と仲良くしないって意味じゃないよね。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：匂わせたのは、香水だけだった。",
          "text": "噂は薄れたが、貸し借りを断られたネムは距離を感じた。ルナも断る口実を探すようになった。",
          "effects": {
            "relations": [
              [
                "sister",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "もう借りないって、私と仲良くしないって意味じゃないよね。"
          ],
          [
            "hostess",
            "仲が悪くなったわけじゃない。そう思わせたなら、その話はしたい。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "fridge_empty": {
    "title": "食べた人にも、名前はある。",
    "cast": [
      "peko",
      "fox"
    ],
    "day": 4,
    "detail": "ペコがホロの買い置きを食べた。ペコは共用だから分ける約束だったと言い、ホロは酒のつまみまで含めていないと怒る。",
    "lines": [
      [
        "fox",
        "分けていいって言いましたよね？"
      ],
      [
        "peko",
        "一口って、袋を一つずつって意味じゃないよ。"
      ],
      [
        "manager",
        "同じ言葉で、量が違っていたようですね。"
      ],
      [
        "fox",
        "量の前に、私の楽しみがなくなってる。"
      ]
    ],
    "choices": [
      {
        "id": "repay",
        "label": "今日の分を買い戻してから分け方を決める",
        "hint": "",
        "effects": {
          "funds": -1800,
          "trust": 5,
          "solidarity": 1,
          "residents": {
            "peko": {
              "cash": -600,
              "stress": 4
            }
          },
          "relations": [
            [
              "peko",
              "fox",
              4
            ]
          ]
        },
        "reply": "買い戻します。同じ物がなかったら、似た物でいいですか？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：食べた人にも、名前はある。",
          "text": "夜食を買い戻すとホロは落ち着いた。ペコは弁償のため別の食費を削り、また共用棚を見つめている。",
          "effects": {
            "solidarity": 1,
            "relations": [
              [
                "peko",
                "fox",
                5
              ],
              [
                "peko",
                "fox",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "買い戻します。同じ物がなかったら、似た物でいいですか？"
          ],
          [
            "fox",
            "似た物でも今回はいい。次は食べる前に量まで聞いて。"
          ]
        ]
      },
      {
        "id": "share",
        "label": "共用棚と個人棚を二人で作る",
        "hint": "",
        "effects": {
          "funds": -3500,
          "solidarity": 3,
          "trust": 4,
          "residents": {
            "peko": {
              "hunger": -20
            }
          },
          "relations": [
            [
              "peko",
              "fox",
              2
            ]
          ]
        },
        "reply": "棚を分けます。でも余ってる分を分ける話まで消さないで。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：食べた人にも、名前はある。",
          "text": "個人棚を作って盗み食いは減った。ホロの大瓶が境界を越え、ペコが物差しを持ち出した。",
          "effects": {
            "relations": [
              [
                "peko",
                "fox",
                1
              ]
            ]
          },
          "next": "fridge"
        },
        "replyLines": [
          [
            "peko",
            "棚を分けます。でも余ってる分を分ける話まで消さないで。"
          ],
          [
            "fox",
            "分ける話は残す。でも私の棚に空きがあっても入れないで。"
          ]
        ]
      },
      {
        "id": "blame",
        "label": "残った材料でペコがホロの夜食を作る",
        "hint": "",
        "effects": {
          "trust": -9,
          "allStress": 7,
          "relations": [
            [
              "peko",
              "fox",
              -15
            ]
          ],
          "residents": {
            "peko": {
              "stress": 15
            }
          }
        },
        "reply": "作ります。食べた分の謝罪で、明日からの料理当番じゃないですよね？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：食べた人にも、名前はある。",
          "text": "ペコの夜食は好評だった。ホロは翌日も作ってほしいと頼み、ペコは料理係になった覚えはないと返した。",
          "effects": {
            "relations": [
              [
                "peko",
                "fox",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "作ります。食べた分の謝罪で、明日からの料理当番じゃないですよね？"
          ],
          [
            "fox",
            "今夜だけお願いする。おいしくても明日の当番にはしないよ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "contest": {
    "title": "応援団長が、賞金の予約をした。",
    "cast": [
      "peko",
      "fox"
    ],
    "day": 6,
    "detail": "大食い大会の賞金の使い道で口論。ホロは練習に付き合った分を要求し、ペコは応援に契約はなかったと言う。",
    "lines": [
      [
        "fox",
        "優勝前から打ち上げ代を引かないでください。"
      ],
      [
        "peko",
        "練習で買った食材、応援の空気から生まれてないよ？"
      ],
      [
        "manager",
        "参加前に、協力の範囲を決めましょう。"
      ],
      [
        "fox",
        "応援してほしいけど、賞金全部の話は困る。"
      ]
    ],
    "choices": [
      {
        "id": "team",
        "label": "二人で費用を出し、賞金の配分も決める",
        "hint": "",
        "effects": {
          "funds": -4000,
          "solidarity": 2,
          "relations": [
            [
              "peko",
              "fox",
              4
            ]
          ]
        },
        "reply": "配分は出る前に書いてください。優勝後に応援代が増えるのは困ります。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：応援団長が、賞金の予約をした。",
          "text": "共同出資で大会に参加。ペコが優勝し、取り決めた額を返したが、ホロは次の大会も共同にしようと言い出した。",
          "effects": {
            "funds": 14000,
            "success": 1,
            "residents": {
              "peko": {
                "cash": 4000
              }
            },
            "relations": [
              [
                "peko",
                "fox",
                -3
              ]
            ]
          },
          "next": null,
          "chance": 0.65,
          "failure": {
            "text": "大会では僅差で敗退。ホロは出した費用の話を始め、ペコは負けた直後に精算するなと怒った。二人は参加賞を分けて帰った。",
            "effects": {
              "solidarity": 1,
              "residents": {
                "peko": {
                  "hunger": -40,
                  "stress": 5
                }
              }
            }
          }
        },
        "replyLines": [
          [
            "peko",
            "配分は出る前に書いてください。優勝後に応援代が増えるのは困ります。"
          ],
          [
            "fox",
            "配分は今決めよう。負けた時の費用も書いておきたい。"
          ]
        ]
      },
      {
        "id": "entry",
        "label": "ペコが出場し、ホロは当日の手伝いに絞る",
        "hint": "",
        "effects": {
          "funds": -2000,
          "trust": 4,
          "relations": [
            [
              "peko",
              "fox",
              2
            ]
          ]
        },
        "reply": "一人で出ます。当日の声援まで有料じゃないですよね？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：応援団長が、賞金の予約をした。",
          "text": "ペコは単独で優勝。ホロは当日の助力を喜ばれたが、練習の日々まで消えたようで少し寂しそうだった。",
          "effects": {
            "funds": 6000,
            "success": 1,
            "residents": {
              "peko": {
                "cash": 12000
              }
            },
            "relations": [
              [
                "peko",
                "fox",
                1
              ]
            ]
          },
          "next": null,
          "chance": 0.4,
          "failure": {
            "text": "ペコは賞金を逃した。ホロは励ましたが、練習代の話は言い出せず残った。",
            "effects": {
              "residents": {
                "peko": {
                  "stress": 6,
                  "hunger": -30
                }
              }
            }
          }
        },
        "replyLines": [
          [
            "peko",
            "一人で出ます。当日の声援まで有料じゃないですよね？"
          ],
          [
            "fox",
            "声援は出すよ。練習代の話は大会が終わって落ち着いてからね。"
          ]
        ]
      },
      {
        "id": "job",
        "label": "大会を休み、二人で小さな食事会を開く",
        "hint": "",
        "effects": {
          "funds": -500,
          "trust": 5,
          "solidarity": 1,
          "relations": [
            [
              "peko",
              "fox",
              -2
            ]
          ]
        },
        "reply": "今日は食事会にします。大会を諦めたんじゃなくて延期です。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：応援団長が、賞金の予約をした。",
          "text": "食事会には住人が集まった。大会の喧嘩は止まったが、参加費代わりの食材費が予想を超えた。",
          "effects": {
            "funds": 1000,
            "residents": {
              "peko": {
                "cash": 2500,
                "hunger": -30
              }
            },
            "relations": [
              [
                "peko",
                "fox",
                4
              ]
            ]
          },
          "next": "jobs"
        },
        "replyLines": [
          [
            "peko",
            "今日は食事会にします。大会を諦めたんじゃなくて延期です。"
          ],
          [
            "fox",
            "延期なら日を決めよう。今日の食材代も全部応援費にはしないよ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "soup": {
    "title": "親切の鍋から、説教が煮えた。",
    "cast": [
      "peko",
      "ann"
    ],
    "day": 6,
    "detail": "アンが食費に困るペコへ料理を振る舞ったが、節約の助言で喧嘩に。アンは善意を拒まれたと落ち込む。",
    "lines": [
      [
        "ann",
        "食べた量の反省会までセットなんですか？"
      ],
      [
        "peko",
        "また困ってほしくなかったの。ご飯だけ渡せばよかった？"
      ],
      [
        "manager",
        "食事の話と、生活の話は時間を分けませんか。"
      ],
      [
        "ann",
        "ありがとうは言いたい。でも点数をつけられるのは嫌。"
      ]
    ],
    "choices": [
      {
        "id": "pot",
        "label": "食事だけ一緒にして、相談は別の日にする",
        "hint": "",
        "effects": {
          "funds": -3000,
          "solidarity": 3,
          "allStress": -7,
          "residents": {
            "peko": {
              "hunger": -60
            }
          },
          "trust": 5,
          "relations": [
            [
              "peko",
              "ann",
              4
            ]
          ]
        },
        "reply": "ご飯は一緒に食べたいです。節約の話は、私から切り出してもいいですか？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：親切の鍋から、説教が煮えた。",
          "text": "食卓で説教は止まった。アンは相談をいつ切り出せばいいか迷い、ペコはご飯を楽しんだ後で自分から話した。",
          "effects": {
            "relations": [
              [
                "peko",
                "ann",
                -3
              ]
            ]
          },
          "next": "jobs"
        },
        "replyLines": [
          [
            "peko",
            "ご飯は一緒に食べたいです。節約の話は、私から切り出してもいいですか？"
          ],
          [
            "ann",
            "あなたから話してくれたら聞く。食卓ではまず一緒に食べよう。"
          ]
        ]
      },
      {
        "id": "voucher",
        "label": "ペコにも料理を担当してもらう",
        "hint": "",
        "effects": {
          "funds": -1500,
          "trust": 8,
          "residents": {
            "peko": {
              "hunger": -45,
              "stress": -10
            }
          },
          "relations": [
            [
              "peko",
              "ann",
              2
            ]
          ]
        },
        "reply": "私も作ります。量の感覚だけは、少し違うかもしれません。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：親切の鍋から、説教が煮えた。",
          "text": "ペコの料理は量が多く、アンの冷蔵庫に三日分入った。助けられる側が入れ替わり、少しだけ会話が変わった。",
          "effects": {
            "relations": [
              [
                "peko",
                "ann",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "私も作ります。量の感覚だけは、少し違うかもしれません。"
          ],
          [
            "ann",
            "量は先に相談しよう。私の冷蔵庫にも限界はあるの。"
          ]
        ]
      },
      {
        "id": "loan",
        "label": "一度持ち帰りにして、二人の距離を置く",
        "hint": "",
        "effects": {
          "funds": -2000,
          "trust": 2,
          "residents": {
            "peko": {
              "cash": 2000,
              "debt": 2000
            }
          },
          "relations": [
            [
              "peko",
              "ann",
              -2
            ]
          ]
        },
        "reply": "持ち帰りでも嬉しいです。空の容器はちゃんと返します。",
        "follow": {
          "delay": 48,
          "title": "仲裁のあと：親切の鍋から、説教が煮えた。",
          "text": "持ち帰りで気楽になったが、アンはお礼の顔を見られず寂しくなった。ペコは空の容器に手紙を入れた。",
          "effects": {
            "trust": -2,
            "residents": {
              "peko": {
                "stress": 7
              }
            },
            "relations": [
              [
                "peko",
                "ann",
                4
              ]
            ]
          },
          "next": "jobs"
        },
        "replyLines": [
          [
            "peko",
            "持ち帰りでも嬉しいです。空の容器はちゃんと返します。"
          ],
          [
            "ann",
            "容器は次でいい。お礼のためだけに無理して来なくてもいいから。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "midnight": {
    "title": "秘密の客と、公開の苦情。",
    "cast": [
      "ann",
      "hostess"
    ],
    "day": 8,
    "detail": "アンの深夜の来客をルナが咎める。アンは仕事の帰りも遅いルナに言われたくないと反論し、詮索だと感じている。",
    "lines": [
      [
        "hostess",
        "足音で起きるの。相手が誰かは聞いてない。"
      ],
      [
        "ann",
        "この前は誰か聞いたでしょう。どこまで答えれば静かになるの？"
      ],
      [
        "manager",
        "音についての話を、私生活の話から切り離しましょう。"
      ],
      [
        "hostess",
        "その線を守ってくれるなら話す。"
      ]
    ],
    "choices": [
      {
        "id": "privacy",
        "label": "来客の動線だけ二人で確認する",
        "hint": "",
        "effects": {
          "funds": -500,
          "trust": 8,
          "allStress": -3,
          "relations": [
            [
              "ann",
              "hostess",
              4
            ]
          ]
        },
        "reply": "動線の話ならする。誰が来るかまで説明する約束にはしない。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：秘密の客と、公開の苦情。",
          "text": "音だけの話にした二人は動線を変えた。騒音は減ったが、説明を省いた分だけ廊下の噂が残った。",
          "effects": {
            "relations": [
              [
                "ann",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "動線の話ならする。誰が来るかまで説明する約束にはしない。"
          ],
          [
            "hostess",
            "誰かは聞かない。眠れる動線だけ一緒に確かめたい。"
          ]
        ]
      },
      {
        "id": "luna",
        "label": "二人とも帰宅の時間帯を共有する",
        "hint": "",
        "effects": {
          "trust": 5,
          "solidarity": 1,
          "relations": [
            [
              "ann",
              "hostess",
              8
            ]
          ]
        },
        "reply": "私も帰る時間は伝える。でも遅れた理由まで毎回必要？",
        "follow": {
          "delay": 6,
          "title": "仲裁のあと：秘密の客と、公開の苦情。",
          "text": "帰宅時間を共有して鉢合わせは減った。予定を知っているため、今度は遅れた相手を心配するようになった。",
          "effects": {
            "relations": [
              [
                "ann",
                "hostess",
                1
              ]
            ]
          },
          "next": "night_talk"
        },
        "replyLines": [
          [
            "ann",
            "私も帰る時間は伝える。でも遅れた理由まで毎回必要？"
          ],
          [
            "hostess",
            "遅れた理由は要らない。今夜も帰るのかだけ分かれば助かるわ。"
          ]
        ]
      },
      {
        "id": "rumor",
        "label": "来客の連絡は管理人だけが受ける",
        "hint": "",
        "effects": {
          "buzz": 15,
          "trust": -13,
          "allStress": 5,
          "relations": [
            [
              "ann",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "管理人さんにだけ連絡する。ほかの人へは回さないでね。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：秘密の客と、公開の苦情。",
          "text": "管理人へ連絡が集まり二人の口論は止まった。ただしアンの私生活を管理人が抱え、頼まれる回数が増えた。",
          "effects": {
            "relations": [
              [
                "ann",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "管理人さんにだけ連絡する。ほかの人へは回さないでね。"
          ],
          [
            "hostess",
            "管理人に任せる。でも私への苦情もそこへ届く形にしてね。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "pregnancy": {
    "title": "相談したことと、任せたことは違う。",
    "cast": [
      "ann",
      "hostess"
    ],
    "day": 12,
    "requires": "midnight",
    "sensitive": true,
    "detail": "生活について相談したアンに、ルナが先回りして予定を組んだ。アンは助かる一方、自分で決める時間がほしいと伝える。",
    "lines": [
      [
        "hostess",
        "心配だからって、予定まで決めないでほしい。"
      ],
      [
        "ann",
        "何もしないで待つのも怖いの。誰かに話してはいないよ。"
      ],
      [
        "manager",
        "本人が頼みたいことを、一つずつ聞きましょう。"
      ],
      [
        "hostess",
        "今は話を聞いてほしい。それだけでもいい？"
      ]
    ],
    "choices": [
      {
        "id": "listen",
        "label": "アンが頼みたい手伝いだけメモする",
        "hint": "",
        "effects": {
          "funds": -2000,
          "trust": 10,
          "residents": {
            "ann": {
              "stress": -18
            }
          },
          "relations": [
            [
              "ann",
              "hostess",
              4
            ]
          ]
        },
        "reply": "今お願いしたいのは、話を聞いてもらうこと。予定は自分で決めたい。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：相談したことと、任せたことは違う。",
          "text": "アンが希望する手伝いだけ決まった。ルナは待つことに戸惑ったが、次の依頼を本人から受け取れた。",
          "effects": {
            "trust": 5,
            "residents": {
              "ann": {
                "stress": -8
              }
            },
            "relations": [
              [
                "ann",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "今お願いしたいのは、話を聞いてもらうこと。予定は自分で決めたい。"
          ],
          [
            "hostess",
            "頼まれたことから手伝う。先に予定を決めないようにするね。"
          ]
        ]
      },
      {
        "id": "permission",
        "label": "二人で次に話す日を決める",
        "hint": "",
        "effects": {
          "funds": -1000,
          "trust": 8,
          "solidarity": 1,
          "relations": [
            [
              "ann",
              "hostess",
              2
            ]
          ]
        },
        "reply": "次に話す日までに決まらなくても、また聞いてくれる？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：相談したことと、任せたことは違う。",
          "text": "次に話す日を決めて二人は休めた。約束の日、アンはまだ決められないことを話し、ルナも急かさず聞いた。",
          "effects": {
            "relations": [
              [
                "ann",
                "hostess",
                12
              ],
              [
                "ann",
                "hostess",
                1
              ]
            ],
            "residents": {
              "ann": {
                "stress": -10
              }
            }
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "次に話す日までに決まらなくても、また聞いてくれる？"
          ],
          [
            "hostess",
            "決まらなくても聞く。会う日は結論を出す期限にしない。"
          ]
        ]
      },
      {
        "id": "tell",
        "label": "連絡は管理人が受け、ルナはいったん休む",
        "hint": "",
        "effects": {
          "trust": -22,
          "residents": {
            "ann": {
              "stress": 22
            }
          },
          "allStress": 3,
          "relations": [
            [
              "ann",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "窓口はお願いしたい。でもルナと話したくなったら自分で声をかける。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：相談したことと、任せたことは違う。",
          "text": "ルナは休めたが、アンは連絡先が一つになって遠慮した。管理人が声をかけると、また二人で話したいと言った。",
          "effects": {
            "trust": -5,
            "relations": [
              [
                "ann",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "窓口はお願いしたい。でもルナと話したくなったら自分で声をかける。"
          ],
          [
            "hostess",
            "自分から声をかけてくれたら嬉しい。連絡がない日も急かさないよ。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "patron_secret": {
    "title": "同じ台詞に、二枚の請求書。",
    "cast": [
      "ann",
      "hostess"
    ],
    "day": 10,
    "requires": "midnight",
    "detail": "徳蔵が二人へ同じ贈り物の約束をしていた。アンはルナが知っていたと疑い、ルナは自分も被害者だと言う。",
    "lines": [
      [
        "hostess",
        "あの人の名前を知らないって、本当だった？"
      ],
      [
        "ann",
        "名前なんて毎回違うのよ。私に答えさせないで。"
      ],
      [
        "manager",
        "二人の責任の話より、相手に確かめることを揃えましょう。"
      ],
      [
        "hostess",
        "一緒に聞くと、また私たちが比べられそう。"
      ]
    ],
    "choices": [
      {
        "id": "independence",
        "label": "二人の質問を管理人がまとめて渡す",
        "hint": "",
        "effects": {
          "funds": -3000,
          "trust": 9,
          "solidarity": 1,
          "relations": [
            [
              "ann",
              "hostess",
              4
            ]
          ]
        },
        "reply": "同じ質問にどう答えるか見たい。私たちの伝え方のせいにされたくない。",
        "follow": {
          "delay": 48,
          "title": "仲裁のあと：同じ台詞に、二枚の請求書。",
          "text": "管理人へ答えが届き、二人には同じ文面が渡った。徳蔵は説明を人任せにし、二人の怒りがようやく同じ相手へ向いた。",
          "effects": {
            "funds": 2000,
            "success": 1,
            "residents": {
              "ann": {
                "cash": 7000,
                "stress": -12
              }
            },
            "relations": [
              [
                "ann",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "同じ質問にどう答えるか見たい。私たちの伝え方のせいにされたくない。"
          ],
          [
            "hostess",
            "同じ文面を渡すわ。答えが違ったら、私たち同士で責めないで。"
          ]
        ]
      },
      {
        "id": "mediate",
        "label": "別々に確認して、答えだけ照合する",
        "hint": "",
        "effects": {
          "funds": -1000,
          "trust": 5,
          "relations": [
            [
              "ann",
              "hostess",
              2
            ]
          ]
        },
        "reply": "別々に聞く。でも都合のいい部分だけ比べないようにしたい。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：同じ台詞に、二枚の請求書。",
          "text": "別々の答えには違う日付があった。確かめる材料は増えたが、二人はどちらの話が本当かで再び口論になった。",
          "effects": {
            "residents": {
              "ann": {
                "cash": 6000
              }
            },
            "trust": 2,
            "relations": [
              [
                "ann",
                "hostess",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "別々に聞く。でも都合のいい部分だけ比べないようにしたい。"
          ],
          [
            "hostess",
            "答えはそのまま照合しよう。私も都合の悪い所を隠さない。"
          ]
        ]
      },
      {
        "id": "sponsor",
        "label": "贈り物は返し、今夜は二人で話す",
        "hint": "",
        "effects": {
          "trust": -13,
          "buzz": 10,
          "relations": [
            [
              "ann",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "贈り物は返す。返した理由を説明しに来ても、今夜は会いたくない。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：同じ台詞に、二枚の請求書。",
          "text": "贈り物を返して今夜の口論は終わった。徳蔵は返却を口実に訪ね、二人は次は玄関で断ろうと相談した。",
          "effects": {
            "funds": 30000,
            "safety": 5,
            "buzz": 18,
            "success": 1,
            "trust": -5,
            "relations": [
              [
                "ann",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "ann",
            "贈り物は返す。返した理由を説明しに来ても、今夜は会いたくない。"
          ],
          [
            "hostess",
            "今夜は入れない。あなたが会いたくなっても、それはあなたが決めて。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "siblings": {
    "title": "謝罪文に、兄が赤を入れた。",
    "cast": [
      "cat",
      "sister"
    ],
    "chain": true,
    "detail": "ネムが書いた削除のお詫びにモクが修正を要求。ネムは謝っても許さないのかと怒り、喧嘩が再開した。",
    "lines": [
      [
        "sister",
        "これ以上どう書けばいいの？　兄は悪くないって十回書く？"
      ],
      [
        "cat",
        "大げさに書いたらまた面白がられるニャ。"
      ],
      [
        "manager",
        "公開する文章と、二人の謝罪を分けましょう。"
      ],
      [
        "sister",
        "私の言葉じゃない謝罪に意味ある？"
      ]
    ],
    "choices": [
      {
        "id": "talk",
        "label": "公開文は短くし、続きは二人だけで話す",
        "hint": "",
        "effects": {
          "funds": -500,
          "trust": 6,
          "solidarity": 2,
          "relations": [
            [
              "cat",
              "sister",
              22
            ]
          ],
          "scenes": {
            "cat": "chat",
            "sister": "chat"
          }
        },
        "reply": "公開文は短い方がいいニャ。妹との話まで短くするわけじゃないニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：謝罪文に、兄が赤を入れた。",
          "text": "短い公開文は騒ぎを広げずに済んだ。兄妹の話は長引いたが、カメラを置いたまま食事できる夜ができた。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "公開文は短い方がいいニャ。妹との話まで短くするわけじゃないニャ。"
          ],
          [
            "sister",
            "短く書く。その後の話はカメラなしで聞いてほしい。"
          ]
        ]
      },
      {
        "id": "pause",
        "label": "兄が直した文を妹が読み上げて確かめる",
        "hint": "",
        "effects": {
          "trust": 3,
          "relations": [
            [
              "cat",
              "sister",
              8
            ]
          ],
          "residents": {
            "cat": {
              "stress": -4
            },
            "sister": {
              "stress": -4
            }
          }
        },
        "reply": "読んでみて変なら直すニャ。俺の文章も笑われるのは嫌だニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：謝罪文に、兄が赤を入れた。",
          "text": "読み上げて初めて、兄の修正文も他人行儀だと分かった。二人は文章を直し、謝る時まで添削しない約束をした。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "読んでみて変なら直すニャ。俺の文章も笑われるのは嫌だニャ。"
          ],
          [
            "sister",
            "読み上げるよ。変だったら、私の言葉でも言い直していい？"
          ]
        ]
      },
      {
        "id": "blame",
        "label": "公開を待ち、互いに困った点を一つ書く",
        "hint": "",
        "effects": {
          "trust": -8,
          "relations": [
            [
              "cat",
              "sister",
              -12
            ]
          ],
          "residents": {
            "cat": {
              "stress": 15
            }
          }
        },
        "reply": "困ったことは書くニャ。答案みたいに採点しないでほしいニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：謝罪文に、兄が赤を入れた。",
          "text": "メモを交換した兄妹は少し距離を置いた。表向きの謝罪を待つ人は残ったが、二人のための話が先に始まった。",
          "effects": {
            "relations": [
              [
                "cat",
                "sister",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "困ったことは書くニャ。答案みたいに採点しないでほしいニャ。"
          ],
          [
            "sister",
            "採点しない。私の困ったことも、言い訳扱いしないでね。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "fridge": {
    "title": "名前を書いたら、冷蔵庫が狭くなった。",
    "cast": [
      "fox",
      "peko"
    ],
    "chain": true,
    "detail": "個人棚の境界にホロの大瓶がはみ出した。ペコは置ける場所がないと怒り、ホロは空き場所なら使うと言う。",
    "lines": [
      [
        "peko",
        "棚半分って、瓶の首から先は数えないんですか？"
      ],
      [
        "fox",
        "そっちの鍋、一人分の顔して一家族分あるよ。"
      ],
      [
        "manager",
        "棚の幅と、使う日を両方見ましょう。"
      ],
      [
        "peko",
        "私の晩ご飯を廊下に置く案だけは嫌。"
      ]
    ],
    "choices": [
      {
        "id": "cook",
        "label": "棚を寸法で二分し、大物は別にする",
        "hint": "",
        "effects": {
          "funds": -2000,
          "trust": 5,
          "solidarity": 2,
          "relations": [
            [
              "fox",
              "peko",
              15
            ]
          ],
          "scenes": {
            "fox": "chat",
            "peko": "eat"
          }
        },
        "reply": "幅を測ろう。瓶の首が少し出たら、毎回違反にするの？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：名前を書いたら、冷蔵庫が狭くなった。",
          "text": "棚は公平に割れたが大瓶も鍋も入らない。二人は小分け容器を買い、蓋を取り違えてまた呼び合った。",
          "effects": {
            "relations": [
              [
                "fox",
                "peko",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "幅を測ろう。瓶の首が少し出たら、毎回違反にするの？"
          ],
          [
            "peko",
            "瓶の首も幅です。私の鍋の取っ手も数えますから。"
          ]
        ]
      },
      {
        "id": "label",
        "label": "使用日を交代し、今日は鍋を優先する",
        "hint": "",
        "effects": {
          "funds": -500,
          "safety": 2,
          "relations": [
            [
              "fox",
              "peko",
              3
            ]
          ],
          "residents": {
            "peko": {
              "cash": -500
            }
          }
        },
        "reply": "今日は鍋、明日は瓶ね。切り替えの時間も決めとかない？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：名前を書いたら、冷蔵庫が狭くなった。",
          "text": "今日は鍋が入り、明日は瓶が入った。交代の時間に冷蔵庫の前で待つ習慣ができ、引き継ぎが妙に厳しくなった。",
          "effects": {
            "relations": [
              [
                "fox",
                "peko",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "今日は鍋、明日は瓶ね。切り替えの時間も決めとかない？"
          ],
          [
            "peko",
            "交代は食事の後がいいです。まだ食べる物を追い出したくないので。"
          ]
        ]
      },
      {
        "id": "dismiss",
        "label": "二人で今夜食べて棚を一段空ける",
        "hint": "",
        "effects": {
          "trust": -6,
          "relations": [
            [
              "fox",
              "peko",
              -20
            ]
          ],
          "residents": {
            "fox": {
              "stress": 18
            }
          }
        },
        "reply": "食べて空けるなら付き合う。明日また買う物も今決めようよ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：名前を書いたら、冷蔵庫が狭くなった。",
          "text": "食べて空けた棚にホロが補充した。ペコは空けた努力を返してと怒ったが、翌日は二人で買い物へ行った。",
          "effects": {
            "relations": [
              [
                "fox",
                "peko",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "fox",
            "食べて空けるなら付き合う。明日また買う物も今決めようよ。"
          ],
          [
            "peko",
            "明日の買い物も決めましょう。空いた棚を先に埋めた人の勝ちにはしないで。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "night_talk": {
    "title": "相談相手に、説教を返してしまった。",
    "cast": [
      "hostess",
      "ann"
    ],
    "chain": true,
    "detail": "アンの相談にルナが自分の経験を重ねすぎた。アンは話を奪われたと怒り、ルナは慰めたつもりだったと反発。",
    "lines": [
      [
        "ann",
        "それ、私の話じゃなくてあなたの話になってる。"
      ],
      [
        "hostess",
        "似たことがあったから話したの。競争してないわよ。"
      ],
      [
        "manager",
        "今はどちらが聞いてほしい時間ですか？"
      ],
      [
        "ann",
        "聞いてほしかった。それを言う前に話が終わってた。"
      ]
    ],
    "choices": [
      {
        "id": "space",
        "label": "一人ずつ、相手の話を途中で止めずに聞く",
        "hint": "",
        "effects": {
          "funds": -1000,
          "trust": 7,
          "solidarity": 2,
          "relations": [
            [
              "hostess",
              "ann",
              18
            ]
          ],
          "scenes": {
            "hostess": "counsel",
            "ann": "chat"
          }
        },
        "reply": "まず聞くわ。似た経験があっても、途中で私の話にしない。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：相談相手に、説教を返してしまった。",
          "text": "交代で聞くと二人の悩みは似ていても違っていた。答えは出なかったが、話し終わった後の沈黙は楽になった。",
          "effects": {
            "relations": [
              [
                "hostess",
                "ann",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "まず聞くわ。似た経験があっても、途中で私の話にしない。"
          ],
          [
            "ann",
            "最後まで話してからなら、あなたの経験も聞きたい。"
          ]
        ]
      },
      {
        "id": "budget",
        "label": "答えを出さず、二人で夜食にする",
        "hint": "",
        "effects": {
          "funds": -2000,
          "solidarity": 2,
          "trust": 5,
          "relations": [
            [
              "hostess",
              "ann",
              10
            ]
          ]
        },
        "reply": "夜食にしよう。話を変えたから解決したことにはしないでね。",
        "follow": {
          "delay": 36,
          "title": "仲裁のあと：相談相手に、説教を返してしまった。",
          "text": "夜食で場は和んだ。言いかけた本音は残り、アンは翌日改めてルナの部屋を訪ねた。",
          "effects": {
            "funds": 7000,
            "success": 1,
            "residents": {
              "hostess": {
                "cash": 3000
              },
              "ann": {
                "cash": 3000
              }
            },
            "relations": [
              [
                "hostess",
                "ann",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "夜食にしよう。話を変えたから解決したことにはしないでね。"
          ],
          [
            "ann",
            "夜食にしよう。私も答えを急がせすぎたかもしれない。"
          ]
        ]
      },
      {
        "id": "listen_in",
        "label": "今日は別々に管理人へ話してもらう",
        "hint": "",
        "effects": {
          "trust": -8,
          "relations": [
            [
              "hostess",
              "ann",
              -4
            ]
          ],
          "residents": {
            "ann": {
              "stress": 7
            }
          }
        },
        "reply": "別々に話すなら、聞いた内容を勝手に交換しないでほしい。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：相談相手に、説教を返してしまった。",
          "text": "管理人は二人から同じ夜の違う話を聞いた。喧嘩は収まったが、二人は互いに何を話したか気になり始めた。",
          "effects": {
            "relations": [
              [
                "hostess",
                "ann",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "hostess",
            "別々に話すなら、聞いた内容を勝手に交換しないでほしい。"
          ],
          [
            "ann",
            "勝手に交換はしないで。後で二人で話すかは私たちで決めたい。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "produce": {
    "title": "変身の請求先は、本人の自尊心。",
    "cast": [
      "sister",
      "hostess"
    ],
    "chain": true,
    "detail": "ルナに服を選んでもらったネムが、似合うと言われた服を着ない。ルナは買い物の時間を無駄にされたと怒る。",
    "lines": [
      [
        "hostess",
        "似合うけど、私じゃない感じがする。"
      ],
      [
        "sister",
        "嫌なら店で言ってよ。ずっと喜んでたじゃない。"
      ],
      [
        "manager",
        "似合うことと、着たいことは別の話ですね。"
      ],
      [
        "hostess",
        "喜んでほしそうで、言いづらかった。"
      ]
    ],
    "choices": [
      {
        "id": "closet",
        "label": "ネムが残したい一着から組み直す",
        "hint": "",
        "effects": {
          "funds": -500,
          "buzz": 9,
          "solidarity": 2,
          "trust": 5,
          "relations": [
            [
              "sister",
              "hostess",
              15
            ]
          ]
        },
        "reply": "この服だけ残したい。それに合わせて選んでもらえる？",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：変身の請求先は、本人の自尊心。",
          "text": "残した一着を軸にするとネムは着られた。ルナは選んだ服が余って悔しがり、交換の相談を持ち込んだ。",
          "effects": {
            "relations": [
              [
                "sister",
                "hostess",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "この服だけ残したい。それに合わせて選んでもらえる？"
          ],
          [
            "hostess",
            "その一着から選ぶわ。でも残したい物は店で教えてね。"
          ]
        ]
      },
      {
        "id": "sponsor",
        "label": "ルナの提案を一日だけ試して感想を聞く",
        "hint": "",
        "effects": {
          "funds": -3000,
          "buzz": 18,
          "trust": 4,
          "relations": [
            [
              "sister",
              "hostess",
              10
            ]
          ]
        },
        "reply": "一日試す。でも褒められたら次も着るって約束じゃないよ。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：変身の請求先は、本人の自尊心。",
          "text": "一日試した服は好評だった。ネムは褒められた分だけ脱ぎづらくなり、ルナは喜びと戸惑いを後から聞いた。",
          "effects": {
            "funds": 5000,
            "success": 1,
            "residents": {
              "sister": {
                "cash": 1500
              },
              "hostess": {
                "cash": 1500
              }
            },
            "relations": [
              [
                "sister",
                "hostess",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "一日試す。でも褒められたら次も着るって約束じゃないよ。"
          ],
          [
            "hostess",
            "一日だけ試そう。褒められたかより、着ていてどうだったか聞くわ。"
          ]
        ]
      },
      {
        "id": "building",
        "label": "服選びを休み、互いの好きな物を見せる",
        "hint": "",
        "effects": {
          "buzz": 24,
          "safety": -9,
          "trust": -5,
          "relations": [
            [
              "sister",
              "hostess",
              -2
            ]
          ]
        },
        "reply": "好きな服を見せる。似合わないって言う前に、好きな理由も聞いて。",
        "follow": {
          "delay": 16,
          "title": "仲裁のあと：変身の請求先は、本人の自尊心。",
          "text": "好みを見せ合うと、似合う物の理由も分かった。買った服は残り、二人は売るか直すかで小さく言い合った。",
          "effects": {
            "safety": -5,
            "allStress": 6,
            "relations": [
              [
                "sister",
                "hostess",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "sister",
            "好きな服を見せる。似合わないって言う前に、好きな理由も聞いて。"
          ],
          [
            "hostess",
            "好きな理由を聞く。選んだ服を返品する話も後で付き合ってね。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "jobs": {
    "title": "履歴書より、推薦人が盛っている。",
    "cast": [
      "peko",
      "sister"
    ],
    "chain": true,
    "detail": "ネムがペコの求人応募文を派手に書き換えた。ペコは面接で答えられないと怒り、ネムは地味な文では読まれないと言う。",
    "lines": [
      [
        "sister",
        "リーダー経験って、炊飯器の前にいた話ですよね？"
      ],
      [
        "peko",
        "何も書かなかったら、面接にも行けないよ。"
      ],
      [
        "manager",
        "読む人に伝わる話と、本人が話せる話を揃えましょう。"
      ],
      [
        "sister",
        "助けてほしいけど、別人として雇われたくない。"
      ]
    ],
    "choices": [
      {
        "id": "match",
        "label": "ペコが説明できる経験だけ二人で残す",
        "hint": "",
        "effects": {
          "funds": -1000,
          "trust": 7,
          "solidarity": 2,
          "residents": {
            "peko": {
              "stress": -10
            }
          },
          "relations": [
            [
              "peko",
              "sister",
              4
            ]
          ]
        },
        "reply": "説明できる話なら面接で言えます。炊飯器のリーダーは消してください。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：履歴書より、推薦人が盛っている。",
          "text": "実際の経験だけにすると文は短くなった。応募先から調理の話を聞かれ、ペコは初めて自分の言葉で答えられた。",
          "effects": {
            "funds": 3600,
            "residents": {
              "peko": {
                "cash": 3000,
                "debt": -1500
              }
            },
            "success": 1,
            "relations": [
              [
                "peko",
                "sister",
                -3
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "説明できる話なら面接で言えます。炊飯器のリーダーは消してください。"
          ],
          [
            "sister",
            "炊飯器のリーダーは消す。ほかに自分で話せる経験を聞かせて。"
          ]
        ]
      },
      {
        "id": "stall",
        "label": "応募前にネムが面接役をして確かめる",
        "hint": "",
        "effects": {
          "funds": -4000,
          "solidarity": 3,
          "buzz": 12,
          "allStress": -5,
          "relations": [
            [
              "peko",
              "sister",
              2
            ]
          ]
        },
        "reply": "面接の練習、お願いします。答えられないところで笑わないでください。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：履歴書より、推薦人が盛っている。",
          "text": "模擬面接で盛った部分が次々に崩れた。ネムは落ち込んだが、ペコが話せる強みを一緒に見つけた。",
          "effects": {
            "funds": 6500,
            "residents": {
              "peko": {
                "cash": 1800
              }
            },
            "success": 1,
            "relations": [
              [
                "peko",
                "sister",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "面接の練習、お願いします。答えられないところで笑わないでください。"
          ],
          [
            "sister",
            "笑わない。答えられない所を直すための練習にしよう。"
          ]
        ]
      },
      {
        "id": "wait",
        "label": "求人を変え、二人で店を見に行く",
        "hint": "",
        "effects": {
          "trust": 1,
          "relations": [
            [
              "peko",
              "sister",
              -2
            ]
          ]
        },
        "reply": "店を見てから決めたいです。食べたい店と働きたい店は別かもしれないので。",
        "follow": {
          "delay": 24,
          "title": "仲裁のあと：履歴書より、推薦人が盛っている。",
          "text": "店を見たペコが別の求人を選んだ。応募は遅れたが、ネムは勝手に書き換える前に相談するようになった。",
          "effects": {
            "funds": -2400,
            "residents": {
              "peko": {
                "debt": 2400,
                "stress": 8
              }
            },
            "relations": [
              [
                "peko",
                "sister",
                4
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "peko",
            "店を見てから決めたいです。食べたい店と働きたい店は別かもしれないので。"
          ],
          [
            "sister",
            "一緒に見に行く。でもご飯だけ食べて帰るのはなしだからね。"
          ]
        ]
      }
    ],
    "conflict": true
  },
  "roomshare": {
    "title": "仮住まいに、仮の王が二人。",
    "cast": [
      "cat",
      "fox"
    ],
    "chain": true,
    "detail": "修繕中のモクがホロの部屋へ。同じ缶を灰皿と飲み物に使いかけ、互いに場所を占領していると怒る。",
    "lines": [
      [
        "cat",
        "寝る場所まで宴会場にされてるニャ。"
      ],
      [
        "fox",
        "私の部屋なのに、私の晩酌だけ廊下に出すの？"
      ],
      [
        "manager",
        "期限のある同居です。場所か時間、どちらを分けますか。"
      ],
      [
        "cat",
        "どっちを分けても、片づけるのは俺になりそうニャ。"
      ]
    ],
    "choices": [
      {
        "id": "rules",
        "label": "机と寝床を分け、片づけは日替わりにする",
        "hint": "",
        "effects": {
          "funds": -1200,
          "safety": 5,
          "trust": 5,
          "solidarity": 2,
          "relations": [
            [
              "cat",
              "fox",
              12
            ]
          ],
          "scenes": {
            "cat": "chat",
            "fox": "chat"
          },
          "visit": [
            "cat",
            "fox"
          ]
        },
        "reply": "机を分けるなら灰皿もそこだニャ。当番を忘れた日は翌日に回さないニャ。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：仮住まいに、仮の王が二人。",
          "text": "分担ができて二人は話せた。日替わりを忘れたホロにモクが印をつけ、缶より当番表が目立つ部屋になった。",
          "effects": {
            "safety": 4,
            "relations": [
              [
                "cat",
                "fox",
                5
              ],
              [
                "cat",
                "fox",
                -3
              ]
            ]
          },
          "next": "fridge"
        },
        "replyLines": [
          [
            "cat",
            "机を分けるなら灰皿もそこだニャ。当番を忘れた日は翌日に回さないニャ。"
          ],
          [
            "fox",
            "日替わりは守る。灰皿と飲み物の缶は印を変えてよ。"
          ]
        ]
      },
      {
        "id": "hotel",
        "label": "ホロが夜だけ別の場所を使う",
        "hint": "",
        "effects": {
          "funds": -7000,
          "safety": 5,
          "trust": 7,
          "residents": {
            "cat": {
              "stress": -10
            },
            "fox": {
              "stress": -4
            }
          },
          "relations": [
            [
              "cat",
              "fox",
              2
            ]
          ]
        },
        "reply": "夜は眠れるニャ。でもホロを追い出したかったわけじゃないニャ。",
        "follow": {
          "delay": 12,
          "title": "仲裁のあと：仮住まいに、仮の王が二人。",
          "text": "モクは眠れた。ホロは自室の夜を譲ったことに不満を残し、修繕が終わる日を何度も確認した。",
          "effects": {
            "relations": [
              [
                "cat",
                "fox",
                1
              ]
            ]
          },
          "next": null
        },
        "replyLines": [
          [
            "cat",
            "夜は眠れるニャ。でもホロを追い出したかったわけじゃないニャ。"
          ],
          [
            "fox",
            "夜は出るよ。でも私の部屋を借りてることは忘れないで。"
          ]
        ]
      },
      {
        "id": "informal",
        "label": "部屋は分けず、二人で修繕の荷物を減らす",
        "hint": "",
        "effects": {
          "trust": 1,
          "visit": [
            "cat",
            "fox"
          ],
          "scenes": {
            "cat": "chat",
            "fox": "chat"
          },
          "relations": [
            [
              "cat",
              "fox",
              -2
            ]
          ]
        },
        "reply": "荷物を減らすニャ。捨てる前に、何の缶か聞いてほしいニャ。",
        "follow": {
          "delay": 8,
          "title": "仲裁のあと：仮住まいに、仮の王が二人。",
          "text": "荷物を減らすうちに互いの物を勝手にまとめた。広くなった床で、今度は何を捨てたかの口論が始まった。",
          "effects": {
            "funds": -3500,
            "relations": [
              [
                "cat",
                "fox",
                -18
              ],
              [
                "cat",
                "fox",
                4
              ]
            ],
            "allStress": 5
          },
          "next": "fridge"
        },
        "replyLines": [
          [
            "cat",
            "荷物を減らすニャ。捨てる前に、何の缶か聞いてほしいニャ。"
          ],
          [
            "fox",
            "捨てる前に聞く。そっちも私の缶を勝手に灰皿にしないでね。"
          ]
        ]
      }
    ],
    "conflict": true
  }
};

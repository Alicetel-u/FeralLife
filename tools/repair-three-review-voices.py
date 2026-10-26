#!/usr/bin/env python3
"""Exactly three approved voice repairs; no scenario/dialogue changes."""
import json, os, pathlib, subprocess, urllib.request, urllib.error, time

ROOT = pathlib.Path(__file__).resolve().parents[1]
os.chdir(ROOT)
MANIFEST = ROOT / "src/voice-manifest.js"
PREFIX = "// Generated clips only.\nexport const VOICE_MANIFEST = "
raw = MANIFEST.read_text(encoding="utf-8")
if not raw.startswith(PREFIX):
    raise RuntimeError("Unexpected voice manifest header")
manifest = json.loads(raw[len(PREFIX):].rstrip().removesuffix(";"))

TARGETS = [
    ("manager", "うわっくっせぇ！！煙だらけじゃねーか！", "retort", False),
    ("cat", "大家、いい知らせニャ。", "moku-happy", False),
    ("manager", "立ってた場所だけじゃねぇか！", "normal", False),
]
keys = [json.dumps(list(t), ensure_ascii=False, separators=(",", ":")) for t in TARGETS]
for key in keys:
    if key not in manifest:
        raise RuntimeError("Missing exact dialogue key: " + key)
    if not (ROOT / manifest[key]["file"]).is_file():
        raise RuntimeError("Missing current source audio: " + key)

def command(args, capture=False):
    p = subprocess.run(args, check=True, capture_output=capture, text=capture)
    return p.stdout if capture else None

def synthesize(voice_id, spoken, settings, destination):
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        raise RuntimeError("Missing GitHub secret ELEVENLABS_API_KEY; no audio changed")
    payload = {"text": spoken, "model_id": "eleven_v3", "voice_settings": settings}
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
    req = urllib.request.Request(url, data=json.dumps(payload, ensure_ascii=False).encode(), headers={
        "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"
    }, method="POST")
    # Never blindly retry a potentially charged request.
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            audio = resp.read()
            if not resp.headers.get("Content-Type", "").startswith("audio/") or len(audio) < 128:
                raise RuntimeError("Invalid audio response; check ElevenLabs history")
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"ElevenLabs HTTP {exc.code}; no automatic retry") from None
    destination.write_bytes(audio)

def master(src, dest):
    command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src),
             "-af", "loudnorm=I=-18:TP=-3:LRA=11,apad=pad_dur=0.25",
             "-c:a", "libmp3lame", "-q:a", "2", str(dest)])
    duration = float(command(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                             "-of", "default=noprint_wrappers=1:nokey=1", str(dest)], capture=True))
    if duration < 0.75:
        raise RuntimeError("Unexpectedly short generated recording")

outdir = ROOT / "assets/voices"
outdir.mkdir(exist_ok=True, parents=True)
staged = []
# Require credentials before modifying anything. All three output files are written
# only after the charged calls succeed. Re-run only after history reconciliation.
if not os.environ.get("ELEVENLABS_API_KEY"):
    raise RuntimeError("Configure ELEVENLABS_API_KEY GitHub Actions secret first")

# 1: Look up the historical recording of the exact same line (not the current repair).
oldest = None
commits = command(["git", "log", "--format=%H", "--", "src/voice-manifest.js"], capture=True).splitlines()
for sha in reversed(commits):
    p = subprocess.run(["git", "show", f"{sha}:src/voice-manifest.js"], capture_output=True, text=True)
    if p.returncode or not p.stdout.startswith(PREFIX):
        continue
    try:
        historic = json.loads(p.stdout[len(PREFIX):].rstrip().removesuffix(";"))
        candidate = historic[keys[0]]["file"]
    except (ValueError, KeyError):
        continue
    if candidate == manifest[keys[0]]["file"]:
        continue
    check = subprocess.run(["git", "cat-file", "-e", f"{sha}:{candidate}"], capture_output=True)
    if check.returncode == 0:
        oldest = (sha, candidate)
        break
if not oldest:
    raise RuntimeError("No historical original was found; avoid replacing good acting with a guess")
old_raw = outdir / "_repair-original-temp.mp3"
try:
    with old_raw.open("wb") as f:
        subprocess.run(["git", "show", f"{oldest[0]}:{oldest[1]}"], stdout=f, check=True)
    staged.append((keys[0], old_raw, "以前の演技が良かった音源に戻し、末尾に0.25秒の余白を加えて音量を調整。"))
    # 2: Regenerate without an extra trailing vowel/sound.
    moku_raw = outdir / "_repair-moku-temp.mp3"
    synthesize("0ptCJp0xgdabdcpVtCB5",
               "[animated] [conversational] おおや、いい知らせニャ。",
               {"stability": 0.5, "similarity_boost": 0.75, "speed": 0.98}, moku_raw)
    staged.append((keys[1], moku_raw, "元気な会話で再生成。語尾に余計な音を加えず、末尾余白を確保。"))
    # 3: Spell out the misunderstood opening word for correct TTS pronunciation.
    manager_raw = outdir / "_repair-manager-temp.mp3"
    synthesize("vY4PC2kSleyw73YRUOI6",
               "[excited] [lighthearted] たってた場所だけじゃねぇか！",
               {"stability": 0.5, "similarity_boost": 0.75, "speed": 1.0}, manager_raw)
    staged.append((keys[2], manager_raw, "「たってた」をかなで指定し、明瞭で勢いのあるツッコミとして再生成。"))
    for idx, (k, original, comment) in enumerate(staged, 1):
        target = outdir / f"voice-review-20261026-{idx}.mp3"
        master(original, target)
        entry = manifest[k]
        entry["file"] = str(target.relative_to(ROOT)).replace(os.sep, "/")
        entry["repairComment"] = comment
        entry["repairReview"] = True
        entry["audioMastering"] = {"integratedLUFS": -18, "truePeakDBTP": -3, "tailPaddingSeconds": 0.25}
    MANIFEST.write_text(PREFIX + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print("Updated exactly three voice manifest entries")
finally:
    for f in [outdir / "_repair-original-temp.mp3",
              outdir / "_repair-moku-temp.mp3",
              outdir / "_repair-manager-temp.mp3"]:
        f.unlink(missing_ok=True)

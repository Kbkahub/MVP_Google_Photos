"""Memory-First Search: public prototype for the Google Photos retrieval case study.

Streamlit hosts the phone app (frontend/) as a custom component.
The component sends two kinds of requests:
  ai  -> Python asks Groq to rerank results and write a follow-up question (Version 2 only)
  log -> Python forwards the session to a Google Sheet (Apps Script webhook)
Secrets (Streamlit > App settings > Secrets):
  GROQ_API_KEY, SHEET_WEBHOOK_URL, SHEET_TOKEN
"""
import json
import time
from pathlib import Path

import requests
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Photos · Memory-First Search", page_icon="🔍", layout="centered",
                   initial_sidebar_state="collapsed")

# Hide Streamlit chrome so the page shows only the phone app
st.markdown("""
<style>
#MainMenu, header, footer, [data-testid="stToolbar"], [data-testid="stDecoration"],
[data-testid="stStatusWidget"], [data-testid="stHeader"] {display:none !important;}
.stApp {background:#e8eaed;}
.block-container {padding:0 !important; max-width:100% !important;}
[data-testid="stVerticalBlock"] {gap:0 !important;}
iframe {display:block; border:0;}
</style>
""", unsafe_allow_html=True)

ROOT = Path(__file__).parent
FRONTEND = ROOT / "frontend"
photos_app = components.declare_component("photos_app", path=str(FRONTEND))


def secret(name):
    try:
        return st.secrets.get(name, "")
    except Exception:
        return ""


GROQ_KEY = secret("GROQ_API_KEY")
SHEET_URL = secret("SHEET_WEBHOOK_URL")
SHEET_TOKEN = secret("SHEET_TOKEN")
GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]  # free tier as of Oct 2026; Llama models were retired 16 Aug 2026


@st.cache_data
def catalog():
    items = json.loads((FRONTEND / "data.json").read_text())
    ids = {it["id"] for it in items}
    lines = "\n".join(" | ".join([it["id"], it["date"], it["place"] or "-", it["event"],
                                  "/".join(it["people"]) or "-", it["desc"]]) for it in items)
    return lines, ids


def parse_json(text):
    """Return the first JSON object in a model reply, tolerating code fences or extra prose."""
    text = text.strip().strip("`")
    if text.lower().startswith("json"):
        text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        start, end = text.find("{"), text.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except Exception:
                return None
    return None


def ask_groq(query):
    """Rerank the library for a vague query and propose one follow-up question."""
    if not GROQ_KEY:
        return {"ok": False, "error": "no_key"}
    query = str(query)[:300]
    lines, ids = catalog()
    prompt = f"""You are the search engine inside a personal photo library app. The owner remembers a photo but may describe it vaguely, using feelings, scenes, people, or a rough time. Today is 1 October 2026, so "last year" means 2025.

Library, one item per line (id | date | place | occasion | people | description):
{lines}

The owner searched for: "{query}"

Reply with a JSON object only:
{{"ids":[up to 12 ids, best match first, only items that plausibly match the search],
"question":"one short follow-up question that would best tell the matching items apart, or an empty string if the top match is clear",
"options":["2 to 4 short answers to that question, each true of at least one matching item"]}}"""
    last_error = "unavailable"
    for model in GROQ_MODELS:
        # gpt-oss models reason before answering: keep reasoning short and leave room for the JSON.
        # If a model rejects the optional parameters, retry the same model with a plain request.
        for extra in ({"response_format": {"type": "json_object"}, "reasoning_effort": "low"}, {}):
            try:
                r = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
                    json={"model": model, "temperature": 0.1, "max_tokens": 2000,
                          "messages": [{"role": "user", "content": prompt}], **extra},
                    timeout=25,
                )
                if r.status_code == 429:
                    last_error = "rate_limited"
                    break  # try the next model
                if r.status_code == 400 and extra:
                    last_error = f"{model}: 400 {r.text[:120]}"
                    continue  # retry without optional parameters
                if r.status_code >= 400:
                    last_error = f"{model}: {r.status_code} {r.text[:120]}"
                    break
                data = parse_json(r.json()["choices"][0]["message"].get("content") or "")
                if data is None:
                    last_error = f"{model}: no JSON in reply"
                    continue
                return {"ok": True, "model": model,
                        "ids": [i for i in data.get("ids", []) if i in ids][:12],
                        "question": str(data.get("question", ""))[:160],
                        "options": [str(o)[:40] for o in data.get("options", [])][:4]}
            except Exception as e:  # network error, timeout, etc.
                last_error = f"{model}: {type(e).__name__}"
                break
    return {"ok": False, "error": last_error}


def log_session(session):
    if not SHEET_URL:
        return {"ok": False, "error": "no_sheet"}
    try:
        r = requests.post(SHEET_URL, data=json.dumps({"token": SHEET_TOKEN, "session": session}),
                          headers={"Content-Type": "text/plain"}, timeout=15)
        return {"ok": r.ok}
    except Exception as e:
        return {"ok": False, "error": type(e).__name__}


resp = st.session_state.get("resp")
msg = photos_app(resp=resp, ai_enabled=bool(GROQ_KEY), log_enabled=bool(SHEET_URL),
                 key="photos", default=None)

if msg and msg.get("reqId") != st.session_state.get("handled"):
    st.session_state["handled"] = msg["reqId"]
    kind, payload = msg.get("kind"), msg.get("payload") or {}
    if kind == "ai":
        out = ask_groq(payload.get("q", ""))
        if not out.get("ok"):
            print("Groq error:", out.get("error"))
    elif kind == "log":
        out = log_session(payload)
        print("SHEET LOG:", out)
    else:
        out = {"ok": False, "error": "unknown"}
    out["reqId"] = msg["reqId"]
    out["at"] = time.time()
    st.session_state["resp"] = out
    st.rerun()

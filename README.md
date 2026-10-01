# Memory-First Search: Google Photos retrieval prototype

A public, mobile-sized prototype for testing how people find photos they remember but cannot precisely describe.

- **Version 1 (control):** keyword search. Every word must match a label, place, face name, or text in the image.
- **Version 2 (Memory-First Search):** understands scenes, feelings, and rough time; rotating example placeholder; search icon glows after aimless scrolling; "Follow up?" refinement; Groq reranks results and writes the follow-up question.

Participants see a memory cue (photo for 5 s, a fragment, or a story), then find the photo. Every session is logged to a Google Sheet.

## Deploy (about 20 minutes)

### 1. Google Sheet for results
1. Create a new Google Sheet. Open **Extensions > Apps Script**.
2. Delete the sample code, paste `sheet_logger.gs`, and change `TOKEN` to any secret word.
3. **Deploy > New deployment > Web app.** Execute as: *Me*. Who has access: *Anyone*. Authorize.
4. Copy the web app URL (ends in `/exec`).

### 2. GitHub
1. Create a new public repository, for example `memory-first-search`.
2. Upload everything in this folder, keeping the structure (`app.py`, `requirements.txt`, `.streamlit/config.toml`, `frontend/` with `img/`).
   Do **not** upload a `secrets.toml` with real values.

### 3. Streamlit Community Cloud
1. Go to share.streamlit.io, sign in with GitHub, click **Create app**.
2. Pick the repo, branch `main`, main file `app.py`. Choose a custom URL if you like.
3. Open **Advanced settings > Secrets** and paste:
   ```
   GROQ_API_KEY = "gsk_..."
   SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/.../exec"
   SHEET_TOKEN = "the same word you set in the Apps Script"
   ```
4. Deploy. Share the `*.streamlit.app` URL.

### 4. Check it works
- Run one full session yourself. In Version 2, a search should show "Finding better matches", then "Improved with AI".
- Your Google Sheet should get a **Sessions** tab and a **Tasks** tab with your rows.

## Notes
- Groq models: `openai/gpt-oss-120b`, falling back to `openai/gpt-oss-20b` and `qwen/qwen3.6-27b` (Groq retired the Llama models on 16 Aug 2026). If Groq retires these too, edit `GROQ_MODELS` in `app.py` using the IDs at console.groq.com/docs/models.
- Without `GROQ_API_KEY`, Version 2 still works with its local engine (no AI reranking).
- Without `SHEET_WEBHOOK_URL`, results stay on the device; participants can tap **Copy results** at the end.
- Free Streamlit apps sleep after a few days without visits. Open the link yourself before sharing it.
- Photos are from Unsplash; documents and screenshots are generated and fictional.

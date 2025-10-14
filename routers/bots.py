from fastapi import APIRouter, UploadFile, Form, HTTPException, Depends
from typing import List, Optional
from utils import rag_utils, file_utils, db_utils

router = APIRouter(prefix="/bots", tags=["Bots"])

@router.get("/bots")
def list_bots():
    """List all bots with config."""
    return db_utils.get_all_bots()

@router.get("/{bot_id}")
def get_bot(bot_id: str):
    """Fetch one bot (alias for frontends that call GET /bots/{id})."""
    bot = db_utils.get_bot_config(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    # normalize to include id
    if "bot_id" not in bot:
        bot["bot_id"] = bot_id
    return bot

@router.post("/create")
async def create_bot(
    bot_name: str = Form(...),
    system_prompt: str = Form(...),
    logos: List[UploadFile] = [],
    pdfs: List[UploadFile] = []
):
    """Create a new bot and its FAISS vectorstore."""
    if len(logos) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 logos required.")
    if not pdfs:
        raise HTTPException(status_code=400, detail="At least 1 PDF required.")

    bot_id, bot_dir = file_utils.init_bot_folders(bot_name)
    logo_paths = file_utils.save_logos(bot_dir, logos)
    pdf_paths = file_utils.save_pdfs(bot_dir, pdfs)

    rag_utils.create_vectorstore(pdf_paths, f"{bot_dir}/vectorstore")

    bot_config = {
        "bot_id": bot_id,  # <-- include id in config for frontend convenience
        "bot_name": bot_name,
        "system_prompt": system_prompt,
        "logos": logo_paths,            # e.g. ["axia/logos/left.png", "axia/logos/right.png"]
        "pdfs": pdf_paths,              # e.g. ["axia/pdfs/doc1.pdf"]
        "vectorstore_path": f"{bot_dir}/vectorstore"
    }

    db_utils.save_config(bot_dir, bot_config)
    return {"status": "success", "bot": bot_config}

@router.delete("/{bot_id}")
def delete_bot(bot_id: str):
    """Delete a bot."""
    db_utils.delete_bot(bot_id)
    return {"status": "deleted"}

@router.post("/{bot_id}/update")
async def update_bot(
    bot_id: str,
    system_prompt: str = Form(...),
    new_logos: List[UploadFile] = [],
    new_pdfs: List[UploadFile] = [],
    rebuild_vectorstore: bool = Form(False)
):
    """Update bot prompt/logos/PDFs and optionally rebuild vectorstore."""
    bot_config = db_utils.get_bot_config(bot_id)
    if not bot_config:
        raise HTTPException(status_code=404, detail="Bot not found")

    bot_dir = f"bots/{bot_id}"
    bot_config["system_prompt"] = system_prompt

    if len(new_logos) not in (0, 2):
        raise HTTPException(status_code=400, detail="Provide exactly 2 files for new_logos or none.")
    if len(new_logos) == 2:
        bot_config["logos"] = file_utils.save_logos(bot_dir, new_logos)

    if new_pdfs:
        new_pdfs_paths = file_utils.save_pdfs(bot_dir, new_pdfs)
        bot_config["pdfs"].extend(new_pdfs_paths)

    if rebuild_vectorstore:
        rag_utils.create_vectorstore(bot_config["pdfs"], bot_config["vectorstore_path"])

    db_utils.save_config(bot_dir, bot_config)
    bot_config.setdefault("bot_id", bot_id)
    return {"status": "updated", "bot": bot_config}

# ---------- OPTIONAL ALIASES for your existing api.ts style ----------

@router.post("")   # POST /bots  -> alias to /bots/create
async def create_bot_alias(
    name: str = Form(None),
    bot_name: Optional[str] = Form(None),
    system_prompt: str = Form(...),
    logos: List[UploadFile] = [],                 # if provided as array
    logo_left: UploadFile = None,                 # or provided as left/right
    logo_right: UploadFile = None,
    pdfs: List[UploadFile] = []
):
    # Normalize fields
    bot_name = bot_name or name
    if not bot_name:
        raise HTTPException(status_code=422, detail="Provide bot_name (or name).")

    # Normalize logos to array length 2
    if logos and len(logos) == 2:
        pass
    else:
        logos = [x for x in [logo_left, logo_right] if x]
    if len(logos) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 logos required (logos[] or logo_left+logo_right).")

    if not pdfs:
        raise HTTPException(status_code=400, detail="At least 1 PDF required.")

    # Reuse main create
    return await create_bot(bot_name=bot_name, system_prompt=system_prompt, logos=logos, pdfs=pdfs)

@router.put("/{bot_id}")  # PUT /bots/{id} -> alias to /bots/{id}/update
async def update_bot_alias(
    bot_id: str,
    system_prompt: str = Form(None),
    pdfs: List[UploadFile] = [],
    logo_left: UploadFile = None,
    logo_right: UploadFile = None,
    rebuild_vectorstore: bool = Form(False)
):
    # Map to new_* fields used by update_bot
    new_logos = [x for x in [logo_left, logo_right] if x]
    if new_logos and len(new_logos) != 2:
        raise HTTPException(status_code=400, detail="Provide both logo_left and logo_right, or none.")
    if system_prompt is None:
        # keep existing prompt
        bot = db_utils.get_bot_config(bot_id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot not found")
        system_prompt = bot.get("system_prompt", "")

    return await update_bot(
        bot_id=bot_id,
        system_prompt=system_prompt,
        new_logos=new_logos,
        new_pdfs=pdfs,
        rebuild_vectorstore=rebuild_vectorstore
    )

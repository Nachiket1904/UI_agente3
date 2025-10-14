import os
import shutil

BOTS_DIR = "bots"
os.makedirs(BOTS_DIR, exist_ok=True)

def init_bot_folders(bot_name):
    bot_id = bot_name.replace(" ", "_").lower()
    bot_dir = os.path.join(BOTS_DIR, bot_id)
    os.makedirs(f"{bot_dir}/logos", exist_ok=True)
    os.makedirs(f"{bot_dir}/files", exist_ok=True)
    os.makedirs(f"{bot_dir}/vectorstore", exist_ok=True)
    return bot_id, bot_dir

def save_logos(bot_dir, logos):
    logo_paths = []
    for i, logo in enumerate(logos):
        path = f"{bot_dir}/logos/logo{i+1}.png"
        with open(path, "wb") as f:
            f.write(logo.file.read())
        logo_paths.append(path)
    return logo_paths

def save_pdfs(bot_dir, pdfs):
    pdf_paths = []
    for pdf in pdfs:
        pdf_path = f"{bot_dir}/files/{pdf.filename}"
        with open(pdf_path, "wb") as f:
            f.write(pdf.file.read())
        pdf_paths.append(pdf_path)
    return pdf_paths

def delete_bot(bot_id):
    bot_dir = os.path.join(BOTS_DIR, bot_id)
    if os.path.exists(bot_dir):
        shutil.rmtree(bot_dir)

import os, json

BOTS_DIR = "bots"

def get_all_bots():
    bots = []
    if not os.path.exists(BOTS_DIR):
        return bots
    for folder in os.listdir(BOTS_DIR):
        config_path = os.path.join(BOTS_DIR, folder, "config.json")
        if os.path.exists(config_path):
            with open(config_path) as f:
                bot = json.load(f)
                bot["id"] = folder
                bots.append(bot)
    return bots

def get_bot_config(bot_id):
    config_path = os.path.join(BOTS_DIR, bot_id, "config.json")
    if os.path.exists(config_path):
        with open(config_path) as f:
            return json.load(f)
    return None

def save_config(bot_dir, bot_config):
    with open(f"{bot_dir}/config.json", "w") as f:
        json.dump(bot_config, f, indent=4)

def delete_bot(bot_id):
    import shutil
    bot_dir = os.path.join(BOTS_DIR, bot_id)
    if os.path.exists(bot_dir):
        shutil.rmtree(bot_dir)

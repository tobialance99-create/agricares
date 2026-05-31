from core.firebase import db

SYSTEM_COLLECTION = 'system'

DEFAULT_THEME = {
    'primaryColor': '#478347',
    'secondaryColor': '#87b787',
    'dangerColor': '#e53e3e',
    'backgroundColor': '#fff9e9',
    'textColor': '#204a0e',
    'borderRadius': '8px',
    'minecraftMode': False,
    'minecraftLogo': False,
    'minecraftHero': False,
    'minecraftSteve': False,
    'minecraftMusic': False,
}

def get_theme():
    doc = db.collection(SYSTEM_COLLECTION).document('theme').get()
    if doc.exists:
        data = doc.to_dict()
        merged = {**DEFAULT_THEME, **data}
        if merged != data:
            db.collection(SYSTEM_COLLECTION).document('theme').set(merged)
        return merged
    db.collection(SYSTEM_COLLECTION).document('theme').set(DEFAULT_THEME)
    return DEFAULT_THEME

def update_theme(data):
    db.collection(SYSTEM_COLLECTION).document('theme').set(data, merge=True)

def get_system_config():
    doc = db.collection(SYSTEM_COLLECTION).document('config').get()
    if doc.exists:
        return doc.to_dict()
    return {'isSystemEnabled': True, 'disabledEndpoints': []}

def update_system_config(data):
    db.collection(SYSTEM_COLLECTION).document('config').set(data, merge=True)

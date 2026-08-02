"""
seeds.py — Pre-populates the database with curated community stories.

Run automatically on first startup (when the table is empty) via main.py.
Safe to call multiple times — checks for existing seeded data first.
"""
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import ExplorerStory

logger = logging.getLogger(__name__)

SEEDED_STORIES = [
    {
        "state_id": "rajasthan",
        "clerk_user_id": "seeded",
        "explorer_name": "Priya S.",
        "avatar_emoji": "🌸",
        "text": "Watching the sun set over Jaisalmer Fort felt like time travel. The golden city turns amber as the light dies — absolutely surreal. The camel ride through the Thar Desert under a billion stars was worth every grain of sand in my shoes.",
        "photo_path": None,
    },
    {
        "state_id": "rajasthan",
        "clerk_user_id": "seeded",
        "explorer_name": "Arjun M.",
        "avatar_emoji": "🏰",
        "text": "Amber Fort's mirror room literally made me stop breathing. Thousands of tiny mirrors, one candle — and suddenly you're standing inside a galaxy. No filter needed, no words do it justice.",
        "photo_path": None,
    },
    {
        "state_id": "kerala",
        "clerk_user_id": "seeded",
        "explorer_name": "Kavitha R.",
        "avatar_emoji": "🌴",
        "text": "Woke up at 5am on the Alleppey houseboat to absolute silence — just water, mist, and birds. Kerala unfolds itself slowly, like a secret being whispered. The backwaters aren't just scenery. They're a way of life.",
        "photo_path": None,
    },
    {
        "state_id": "kerala",
        "clerk_user_id": "seeded",
        "explorer_name": "Rohan D.",
        "avatar_emoji": "🐘",
        "text": "Saw wild elephants in Wayanad from about 30 metres away. Heart was pounding. The forest guide was utterly calm. That juxtaposition — the elephant's total indifference, the guide's deep knowing — taught me more about this land than any guidebook.",
        "photo_path": None,
    },
    {
        "state_id": "goa",
        "clerk_user_id": "seeded",
        "explorer_name": "Sneha P.",
        "avatar_emoji": "🌊",
        "text": "Everyone talks about Goa's beaches. No one warns you about how beautiful the old Portuguese churches are at golden hour — Basilica of Bom Jesus glowed like it was made of honey. Old Goa is an entirely different world.",
        "photo_path": None,
    },
    {
        "state_id": "himachal pradesh",
        "clerk_user_id": "seeded",
        "explorer_name": "Vikram T.",
        "avatar_emoji": "🏔️",
        "text": "Spiti Valley is the most alien landscape I have ever seen in my own country. White river, brown mountains, ancient monasteries clinging to vertical cliffs. At 4400m altitude, every breath is earned — and every view is a reward.",
        "photo_path": None,
    },
    {
        "state_id": "uttar pradesh",
        "clerk_user_id": "seeded",
        "explorer_name": "Meera L.",
        "avatar_emoji": "🕌",
        "text": "The Taj Mahal at sunrise — pre-5am entry, almost no one around. The marble was blush pink. The silence was enormous. I had read about it my whole life and still was not prepared. Some things earn their legend.",
        "photo_path": None,
    },
    {
        "state_id": "karnataka",
        "clerk_user_id": "seeded",
        "explorer_name": "Suresh K.",
        "avatar_emoji": "🏯",
        "text": "Hampi broke me open. The scale of the Vijayanagara Empire, now just boulders and ruins in the middle of banana plantations — it's profound and melancholy at the same time. Spent two full days and still felt rushed.",
        "photo_path": None,
    },
    {
        "state_id": "tamil nadu",
        "clerk_user_id": "seeded",
        "explorer_name": "Ananya V.",
        "avatar_emoji": "🎨",
        "text": "Madurai's Meenakshi Temple is a complete world unto itself. The gopurams are so dense with sculpture you could spend a week and still discover new figures. Arrived just before the evening lamp ceremony — the chanting filled the stone corridors like music.",
        "photo_path": None,
    },
    {
        "state_id": "west bengal",
        "clerk_user_id": "seeded",
        "explorer_name": "Debraj G.",
        "avatar_emoji": "🎭",
        "text": "Kolkata's tram rattled past the Victoria Memorial at dusk and I thought — this city refuses to let go of any layer of itself. Modernity, nostalgia, chaos, and intellectualism packed into one tram ride. Extraordinary.",
        "photo_path": None,
    },
    {
        "state_id": "maharashtra",
        "clerk_user_id": "seeded",
        "explorer_name": "Nisha B.",
        "avatar_emoji": "🌄",
        "text": "The Ajanta Caves in pre-monsoon haze — ceiling paintings 2000 years old, still holding colour. The artists who made these had no idea their work would outlast every empire that followed. That humility hits different underground.",
        "photo_path": None,
    },
    {
        "state_id": "punjab",
        "clerk_user_id": "seeded",
        "explorer_name": "Gurpreet S.",
        "avatar_emoji": "✨",
        "text": "Golden Temple at 3am is an entirely different experience from the daytime. The sarovar perfectly still, langar still running, a few hundred pilgrims singing shabads. No crowding, no cameras — just pure devotion. One of the most peaceful hours of my life.",
        "photo_path": None,
    },
]


def run_seeds(db: Session) -> None:
    """
    Insert seeded community stories if the table is empty.
    Checks for existing seeded rows first to prevent duplicate seeding.
    """
    existing_count = db.query(ExplorerStory).filter(ExplorerStory.is_seeded == True).count()  # noqa: E712
    if existing_count > 0:
        logger.info("Seeds already present (%d rows). Skipping.", existing_count)
        return

    now = datetime.now(timezone.utc)
    for data in SEEDED_STORIES:
        story = ExplorerStory(
            state_id=data["state_id"],
            clerk_user_id=data["clerk_user_id"],
            explorer_name=data["explorer_name"],
            avatar_emoji=data["avatar_emoji"],
            text=data["text"],
            photo_path=data.get("photo_path"),
            is_seeded=True,
            created_at=now,
        )
        db.add(story)

    db.commit()
    logger.info("Seeded %d community stories.", len(SEEDED_STORIES))

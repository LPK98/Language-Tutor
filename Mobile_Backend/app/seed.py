"""Loads the app's learning content into the database.

The content is copied from the React Native constants so the API returns
exactly what the app shows today:

    src/constants/lessons.ts       -> tutors, featured lessons
    src/constants/learningPath.ts  -> learning_levels, path lessons
    src/constants/practice.ts      -> practice_categories, practice_topics, practice_sets
    src/constants/vocabulary.ts    -> practice_sets, practice_terms, practice_words

Safe to run repeatedly: existing rows are updated, never duplicated.
It does not delete content that was removed from these lists.

Run from the Mobile_Backend folder:
    python -m app.seed
"""

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    LearningLevel,
    Lesson,
    PracticeCategory,
    PracticeSet,
    PracticeTerm,
    PracticeTopic,
    PracticeWord,
    Tutor,
)
from app.models.enums import Category, PracticeSetKind


def slugify(text: str) -> str:
    """Same rule as the app's toNode(): "Who Am I?" -> "who-am-i"."""
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", text.lower()))


TUTORS = [{"id": "emma", "name": "Emma", "position": 0}]

FEATURED_LESSONS = [
    {
        "id": "modals-deduction",
        "title": "Modals of Deduction",
        "category": Category.GRAMMAR,
        "description": "Must, might, can’t — talk about how sure you are.",
        "image_key": "grammar",
    },
    {
        "id": "ordering-food",
        "title": "Ordering at a Cafe",
        "category": Category.LESSON,
        "description": "Order a drink and ask for the bill with confidence.",
        "image_key": "lesson",
    },
    {
        "id": "th-sounds",
        "title": "The /θ/ and /ð/ Sounds",
        "category": Category.PRONUNCIATION,
        "description": "Hear the difference between think and this.",
        "image_key": "pronunciation",
    },
]

LEARNING_PATHS = [
    (
        "beginner",
        "Beginner",
        [
            ("Hello!", "\U0001f44b"),
            ("Magic Words", "⭐"),
            ("Who Am I?", "\U0001f4db"),
            ("This is My...", "\U0001f5bc️"),
            ("How Are You?", "\U0001f4ac"),
            ("My Day", "\U0001f31e"),
            ("I Like...", "❤️"),
        ],
    ),
    (
        "intermediate",
        "Intermediate",
        [
            ("Small Talk", "\U0001f5e3️"),
            ("At the Shops", "\U0001f6cd️"),
            ("Making Plans", "\U0001f4c5"),
            ("On the Phone", "\U0001f4de"),
            ("Directions", "\U0001f9ed"),
            ("Eating Out", "\U0001f37d️"),
            ("My Weekend", "\U0001f392"),
        ],
    ),
    (
        "expert",
        "Expert",
        [
            ("Job Interview", "\U0001f4bc"),
            ("Giving Opinions", "\U0001f4ad"),
            ("Idioms", "\U0001f3af"),
            ("Negotiating", "\U0001f91d"),
            ("Presenting", "\U0001f4ca"),
            ("Debating", "⚖️"),
            ("Storytelling", "\U0001f4d6"),
        ],
    ),
]

PRACTICE_CATEGORIES = [
    ("travel", "Travel & Transportation", "airplane-outline"),
    ("work", "Work & Career", "briefcase-outline"),
    ("social", "Social & Friends", "people-outline"),
    ("dining", "Dining & Food", "restaurant-outline"),
    ("health", "Health & Emergencies", "medkit-outline"),
    ("shopping", "Shopping & Errands", "cart-outline"),
]

# Topic rails, in the order the Practice screen shows them.
PRACTICE_SECTIONS = [
    (
        "travel",
        [
            ("airport", "Airport check-in & security", 5),
            ("taxi", "Booking a taxi / rideshare", 6),
            ("directions", "Asking for directions", 5),
            ("hotel", "Checking into a hotel", 7),
        ],
    ),
    (
        "dining",
        [
            ("restaurant", "Ordering at a restaurant", 6),
            ("cafe", "Coffee shop small talk", 4),
            ("bill", "Splitting the bill", 5),
        ],
    ),
    (
        "work",
        [
            ("interview", "Job interview basics", 8),
            ("standup", "Daily stand-up update", 4),
            ("email", "Writing a follow-up email", 6),
        ],
    ),
]

VOCAB_TERMS = [
    ("processed", "Processed", "Treated or prepared by a series of steps before being sold.",
     "The beans are processed before they reach the shop."),
    ("packaged", "Packaged", "Wrapped or boxed ready for sale or transport.",
     "Everything is packaged by hand at the factory."),
    ("exported", "Exported", "Sent to another country to be sold.",
     "Most of the crop is exported to Europe."),
    ("assembly-line", "Assembly line", "A line of workers and machines that build a product step by step.",
     "She works on the assembly line at the car plant."),
    ("material", "Material", "The substance something is made from.",
     "This jacket is made from recycled material."),
    ("product", "Product", "Something made or grown to be sold.",
     "Their newest product launches in spring."),
    ("will-be-flying", "Will be flying", "Future continuous: an action in progress at a future time.",
     "This time tomorrow I will be flying to Madrid."),
    ("will-be-sleeping", "Will be sleeping", "Future continuous: an action in progress at a future time.",
     "Call later — the kids will be sleeping by then."),
]

GRAMMAR_TERMS = [
    ("must", "Must", "Used when you are almost certain something is true.",
     "You've been travelling all day — you must be tired."),
    ("might", "Might", "Used when something is possible but not certain.",
     "She might be at the office already."),
    ("cant", "Can't", "Used when you are almost certain something is not true.",
     "That can't be his brother — he's an only child."),
]

PRONUNCIATION_WORDS = [
    "Hello", "Hi", "Good morning", "Bye", "See you", "Nice", "Nice to meet you",
    "Good afternoon", "Good evening", "Good night", "Please", "Thank you", "Sorry",
    "Excuse me", "Yes", "No", "How are you?", "Goodbye",
]

PRACTICE_SETS = [
    {
        "id": "grammar",
        "kind": PracticeSetKind.TERMS,
        "title": "Grammar",
        "category": Category.GRAMMAR,
        "emoji": "\U0001f4da",
        "position": 0,
        "unit_label": "Practiced Grammar",
    },
    {
        "id": "pronunciation",
        "kind": PracticeSetKind.SPEECH,
        "title": "Pronunciation",
        "category": Category.PRONUNCIATION,
        "emoji": "\U0001f3a4",
        "position": 1,
        "collection_title": "Lesson Vocabulary",
        "collection_subtitle": "All lesson words",
        "collection_emoji": "\U0001f30d",
    },
    {
        "id": "vocab",
        "kind": PracticeSetKind.TERMS,
        "title": "Vocab",
        "category": Category.VOCABULARY,
        "emoji": "\U0001f4d4",
        "position": 2,
        "unit_label": "Practiced Vocabulary",
    },
]


def _upsert_child(db: Session, model, set_id: str, slug: str, values: dict) -> None:
    """Terms and words are identified by (set_id, slug), not their integer id."""
    row = db.scalar(select(model).where(model.set_id == set_id, model.slug == slug))
    if row is None:
        db.add(model(set_id=set_id, slug=slug, **values))
    else:
        for key, value in values.items():
            setattr(row, key, value)


def seed(db: Session) -> None:
    for tutor in TUTORS:
        db.merge(Tutor(**tutor))

    for position, lesson in enumerate(FEATURED_LESSONS):
        db.merge(Lesson(**lesson, position=position, is_featured=True, level_id=None))

    for level_position, (level_id, level_title, nodes) in enumerate(LEARNING_PATHS):
        db.merge(LearningLevel(id=level_id, title=level_title, position=level_position))
        for position, (title, emoji) in enumerate(nodes):
            db.merge(
                Lesson(
                    id=slugify(title),
                    title=title,
                    emoji=emoji,
                    category=Category.LESSON,
                    level_id=level_id,
                    position=position,
                    is_featured=False,
                )
            )

    section_order = {category_id: index for index, (category_id, _) in enumerate(PRACTICE_SECTIONS)}
    for position, (category_id, label, icon) in enumerate(PRACTICE_CATEGORIES):
        db.merge(
            PracticeCategory(
                id=category_id,
                label=label,
                icon=icon,
                position=position,
                section_position=section_order.get(category_id),
            )
        )
    for category_id, topics in PRACTICE_SECTIONS:
        for position, (topic_id, title, minutes) in enumerate(topics):
            db.merge(
                PracticeTopic(
                    id=topic_id, category_id=category_id, title=title, minutes=minutes, position=position
                )
            )

    for practice_set in PRACTICE_SETS:
        db.merge(PracticeSet(**practice_set))
    # Parents must exist before terms/words reference them.
    db.flush()

    for set_id, terms in (("vocab", VOCAB_TERMS), ("grammar", GRAMMAR_TERMS)):
        for position, (slug, term, definition, example) in enumerate(terms):
            _upsert_child(
                db, PracticeTerm, set_id, slug,
                {"term": term, "definition": definition, "example": example, "position": position},
            )

    for position, word in enumerate(PRONUNCIATION_WORDS):
        _upsert_child(
            db, PracticeWord, "pronunciation", slugify(word), {"word": word, "position": position}
        )

    db.commit()


def main() -> None:
    from app.core.database import SessionLocal

    with SessionLocal() as db:
        seed(db)
    print("Seed complete: tutors, lessons, learning paths and practice content are loaded.")


if __name__ == "__main__":
    main()

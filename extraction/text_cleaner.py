"""
text_cleaner.py — Raw OCR text -> cleaned text.

OCR output is messy: stray whitespace, broken line breaks mid-word,
weird control characters, repeated blank lines. This module cleans
that up before the text goes to summarization, so the LLM/rule-based
parser gets a clearer signal instead of raw OCR noise.

This does NOT try to fix actual misread characters (e.g. "0" vs "O")
— that's a much harder problem and not worth solving for a prototype.
It focuses on structural cleanup only.
"""

import re


def clean_text(raw_text: str) -> str:
    text = raw_text

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove non-printable / control characters (keeps regular unicode
    # text, including Indian scripts, intact)
    text = "".join(ch for ch in text if ch.isprintable() or ch == "\n")

    # Collapse 3+ blank lines down to a single blank line
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse runs of spaces/tabs into a single space
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Strip trailing whitespace on each line
    text = "\n".join(line.rstrip() for line in text.split("\n"))

    # Drop empty lines that are only stray punctuation/noise
    # (common OCR artifact: lines like "-", "_", ".", "|")
    cleaned_lines = []
    for line in text.split("\n"):
        stripped = line.strip()
        if stripped and re.fullmatch(r"[\-\_\.\|=~`]+", stripped):
            continue
        cleaned_lines.append(line)
    text = "\n".join(cleaned_lines)

    return text.strip()

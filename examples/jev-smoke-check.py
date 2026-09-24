#!/usr/bin/env python3
"""Make one minimal Jev Noul request and validate the typed response shape."""

import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ENDPOINT = "https://api.typesafe.ai/v1/systemone"


def main() -> int:
    api_key = os.environ.get("TYPESAFE_API_KEY")
    if not api_key:
        print("Set TYPESAFE_API_KEY in your shell, then rerun this example.", file=sys.stderr)
        return 2

    payload = {
        "state": {
            "post": "I connected Jev to my reading list. It now scores loaded posts against my goal; I still review borderline matches by hand.",
            "reader_goal": "Find first-hand Jev integrations that describe the method and a limitation.",
        },
        "model": "jev-latest",
        "questions": {
            "relevant": {
                "type": "noul",
                "instructions": "Is this a first-hand Jev integration report with a concrete method and limitation?",
                "criteria": {
                    "yes": "The post describes the author's own Jev integration and includes a method plus a limitation.",
                    "no": "The post is only a general opinion, announcement, or promotion without those details.",
                },
            }
        },
    }
    request = Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
    except HTTPError as error:
        print(f"TypeSafe API returned HTTP {error.code}; check your key, account limits, and request.", file=sys.stderr)
        return 1
    except URLError as error:
        print(f"Could not reach the TypeSafe API: {error.reason}", file=sys.stderr)
        return 1
    except (TimeoutError, json.JSONDecodeError) as error:
        print(f"Could not read a valid TypeSafe API response: {error}", file=sys.stderr)
        return 1

    answers = result.get("answers") if isinstance(result, dict) else None
    answer = answers.get("relevant") if isinstance(answers, dict) else None
    probability = answer.get("noul") if isinstance(answer, dict) else None
    if (
        not isinstance(answer, dict)
        or answer.get("type") != "noul"
        or isinstance(probability, bool)
        or not isinstance(probability, (int, float))
        or not 0 <= probability <= 1
    ):
        print("The API response did not contain a valid Noul answer in [0, 1].", file=sys.stderr)
        return 1

    print(f"Jev model: {result.get('model', 'unknown')}")
    print(f"Noul relevance probability: {probability:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

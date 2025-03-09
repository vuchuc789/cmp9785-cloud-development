from typing import Any


def convert_empty_str_to_none(data: Any) -> Any:
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, str) and v == '':
                data[k] = None
    return data

"""
Tools Service — QR code generation and password generation.
"""

import io
import secrets
import string

import qrcode
from qrcode.image.pil import PilImage


def generate_qr(
    data: str,
    size: int = 10,
    error_correction: str = "M",
) -> io.BytesIO:
    """
    Generate a QR code PNG from the given *data* string.
    *size* controls the box size (default 10).
    *error_correction*: L, M, Q, or H.
    """
    ec_map = {
        "L": qrcode.constants.ERROR_CORRECT_L,
        "M": qrcode.constants.ERROR_CORRECT_M,
        "Q": qrcode.constants.ERROR_CORRECT_Q,
        "H": qrcode.constants.ERROR_CORRECT_H,
    }
    ec = ec_map.get(error_correction.upper(), qrcode.constants.ERROR_CORRECT_M)

    qr = qrcode.QRCode(
        version=None,  # auto-detect
        error_correction=ec,
        box_size=size,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img: PilImage = qr.make_image(fill_color="black", back_color="white")

    output = io.BytesIO()
    img.save(output, format="PNG")
    output.seek(0)
    return output


def generate_password(
    length: int = 16,
    include_uppercase: bool = True,
    include_digits: bool = True,
    include_symbols: bool = True,
) -> str:
    """Generate a cryptographically secure random password."""
    chars = string.ascii_lowercase
    if include_uppercase:
        chars += string.ascii_uppercase
    if include_digits:
        chars += string.digits
    if include_symbols:
        chars += string.punctuation

    # Ensure at least one character from each requested category
    password_chars: list[str] = [secrets.choice(string.ascii_lowercase)]
    if include_uppercase:
        password_chars.append(secrets.choice(string.ascii_uppercase))
    if include_digits:
        password_chars.append(secrets.choice(string.digits))
    if include_symbols:
        password_chars.append(secrets.choice(string.punctuation))

    remaining = max(0, length - len(password_chars))
    password_chars.extend(secrets.choice(chars) for _ in range(remaining))

    # Shuffle to avoid predictable positions
    result = list(password_chars)
    secrets.SystemRandom().shuffle(result)
    return "".join(result)

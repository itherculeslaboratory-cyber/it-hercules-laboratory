"""Magic link mail — SMTP is always mocked, never real. No real hosts/keys here."""

from __future__ import annotations

from email import message_from_string
from email.errors import MessageError

import pytest

from libs.ihl.identity import magic_link_mail as mlm


class _FakeSMTP:
    """Stand-in for smtplib.SMTP / SMTP_SSL — records calls, never touches a socket."""

    last_instance: "_FakeSMTP | None" = None

    def __init__(self, host: str, port: int, timeout: int = 30) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout
        self.ehlo_calls = 0
        self.starttls_called = False
        self.login_args: tuple[str, str] | None = None
        self.sendmail_args: tuple[str, list[str], str] | None = None
        _FakeSMTP.last_instance = self

    def ehlo(self) -> None:
        self.ehlo_calls += 1

    def starttls(self) -> None:
        self.starttls_called = True

    def login(self, user: str, password: str) -> None:
        self.login_args = (user, password)

    def sendmail(self, from_addr: str, to_addrs: list[str], msg: str) -> None:
        self.sendmail_args = (from_addr, to_addrs, msg)

    def __enter__(self) -> "_FakeSMTP":
        return self

    def __exit__(self, *exc: object) -> bool:
        return False


@pytest.fixture(autouse=True)
def _fake_smtp(monkeypatch: pytest.MonkeyPatch) -> None:
    _FakeSMTP.last_instance = None
    monkeypatch.setattr(mlm.smtplib, "SMTP", _FakeSMTP)
    monkeypatch.setattr(mlm.smtplib, "SMTP_SSL", _FakeSMTP)


def _set_basic_env(monkeypatch: pytest.MonkeyPatch, **overrides: str) -> None:
    env = {
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "587",
        "SMTP_USER": "dummy-user",
        "SMTP_PASS": "dummy-pass",
        "MAIL_FROM": "IT Hercules Laboratory <noreply@example.com>",
    }
    env.update(overrides)
    for key, value in env.items():
        monkeypatch.setenv(key, value)


def test_missing_smtp_host_raises_runtime_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SMTP_HOST", raising=False)
    with pytest.raises(RuntimeError) as exc_info:
        mlm.send_magic_link_email("user@example.com", "http://localhost:3000/login?token=abc")
    # secrets must never leak into the error message
    assert "smtp.example.com" not in str(exc_info.value)
    assert "dummy-pass" not in str(exc_info.value)


def test_send_success_starttls_plain(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_basic_env(monkeypatch)
    login_url = "http://localhost:3000/login?token=abc123"
    mlm.send_magic_link_email("user@example.com", login_url)

    fake = _FakeSMTP.last_instance
    assert fake is not None
    assert fake.host == "smtp.example.com"
    assert fake.port == 587
    assert fake.starttls_called is True
    assert fake.login_args == ("dummy-user", "dummy-pass")
    assert fake.sendmail_args is not None
    from_addr, to_addrs, raw = fake.sendmail_args
    assert from_addr == "IT Hercules Laboratory <noreply@example.com>"
    assert to_addrs == ["user@example.com"]
    parsed = message_from_string(raw)
    bodies = [
        part.get_payload(decode=True).decode("utf-8") for part in parsed.walk() if not part.is_multipart()
    ]
    assert any(login_url in body for body in bodies)


def test_smtp_ssl_used_when_secure_true(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_basic_env(monkeypatch, SMTP_SECURE="true", SMTP_PORT="465")
    mlm.send_magic_link_email("user@example.com", "http://localhost:3000/login?token=abc")

    fake = _FakeSMTP.last_instance
    assert fake is not None
    assert fake.port == 465
    assert fake.login_args == ("dummy-user", "dummy-pass")
    # SSL path never calls STARTTLS
    assert fake.starttls_called is False


def test_smtp_secure_defaults_true_on_port_465(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_basic_env(monkeypatch, SMTP_PORT="465")
    monkeypatch.delenv("SMTP_SECURE", raising=False)
    mlm.send_magic_link_email("user@example.com", "http://localhost:3000/login?token=abc")

    fake = _FakeSMTP.last_instance
    assert fake is not None
    assert fake.starttls_called is False  # took the SMTP_SSL branch, not STARTTLS


def test_login_url_token_is_url_safe(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_MAGIC_LINK_BASE_URL", "http://localhost:3000")
    # secrets.token_urlsafe never emits '+' or '/', but build_magic_link_login_url
    # must not corrupt tokens that do contain query-breaking characters either.
    token = "a+b/c=d"
    url = mlm.build_magic_link_login_url(token)
    assert "token=a%2Bb%2Fc%3Dd" in url
    assert "+" not in url.split("token=", 1)[1]


def test_japanese_subject_mime_encoded_and_recoverable(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_basic_env(monkeypatch)
    mlm.send_magic_link_email("user@example.com", "http://localhost:3000/login?token=abc")

    fake = _FakeSMTP.last_instance
    assert fake is not None
    _, _, raw = fake.sendmail_args
    parsed = message_from_string(raw)
    subject = parsed["Subject"]
    assert subject is not None
    from email.header import decode_header

    decoded = "".join(
        part.decode(enc or "ascii") if isinstance(part, bytes) else part
        for part, enc in decode_header(subject)
    )
    assert "ログインリンク" in decoded


def test_header_injection_via_crlf_in_recipient_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    _set_basic_env(monkeypatch)
    malicious_to = "victim@example.com\r\nBcc: attacker@evil.example"
    with pytest.raises(MessageError):
        mlm.send_magic_link_email(malicious_to, "http://localhost:3000/login?token=abc")

    fake = _FakeSMTP.last_instance
    # the injected header breaks message serialization before sendmail() is reached
    assert fake is None or fake.sendmail_args is None

"""Magic link email via SMTP (stdlib). Env names match civ-os Express backend/.env."""

from __future__ import annotations

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape


def is_magic_link_mail_configured() -> bool:
    return bool(os.environ.get("SMTP_HOST", "").strip())


def _smtp_from() -> str:
    user = os.environ.get("SMTP_USER", "").strip()
    return os.environ.get("MAIL_FROM", "").strip() or user or "IT Hercules Laboratory <noreply@localhost>"


def build_magic_link_login_url(token: str) -> str:
    base = (
        os.environ.get("IHL_MAGIC_LINK_BASE_URL", "").strip()
        or os.environ.get("PUBLIC_APP_URL", "").strip()
        or "http://localhost:3000"
    ).rstrip("/")
    return f"{base}/login?token={token}"


def send_magic_link_email(to: str, login_url: str) -> None:
    host = os.environ.get("SMTP_HOST", "").strip()
    if not host:
        raise RuntimeError("SMTP_HOST is not set")

    port = int(os.environ.get("SMTP_PORT", "587"))
    secure = os.environ.get("SMTP_SECURE", "").lower() == "true" or port == 465
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASS", "")
    from_addr = _smtp_from()
    subject = (
        os.environ.get("MAGIC_LINK_MAIL_SUBJECT", "").strip()
        or "IT Hercules Laboratory — ログインリンク"
    )

    text = (
        "IT Hercules Laboratory にログインするには、次のリンクを開いてください"
        "（15分以内に無効になります）。\n\n"
        f"{login_url}\n\n"
        "心当たりがない場合はこのメールを無視してください。"
    )
    html = (
        "<p>IT Hercules Laboratory にログインするには、次のボタン（またはリンク）を開いてください。"
        "<br/>有効期限は約15分です。</p>"
        f'<p><a href="{escape(login_url)}" '
        'style="display:inline-block;padding:12px 20px;background:#1a1a2e;color:#fff;'
        'text-decoration:none;border-radius:8px;">ログインする</a></p>'
        f'<p style="font-size:12px;color:#666;word-break:break-all;">{escape(login_url)}</p>'
        '<p style="font-size:12px;color:#999;">心当たりがない場合はこのメールを無視してください。</p>'
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    if secure:
        with smtplib.SMTP_SSL(host, port, timeout=30) as smtp:
            if user:
                smtp.login(user, password)
            smtp.sendmail(from_addr, [to], msg.as_string())
    else:
        with smtplib.SMTP(host, port, timeout=30) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            if user:
                smtp.login(user, password)
            smtp.sendmail(from_addr, [to], msg.as_string())

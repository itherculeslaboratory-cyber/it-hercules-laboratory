# IT Hercules Laboratory — Phase 1 dev image (Python 3.11, no ML heavy stack)
# Design ref: 指示/it-hercules-laboratory/02-設計/_横断/adr/ADR-Phase1-OSS選定表.md
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    IHL_SCHEMAS_ROOT=/schemas \
    STREAMLIT_SERVER_HEADLESS=true \
    STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

WORKDIR /app

# Phase 1 pyproject deps only (no torch/opencv — optional profile later)
COPY pyproject.toml README.md ./
COPY libs/ libs/
COPY components/ components/
COPY apps/search/ apps/search/
COPY apps/api/ apps/api/
COPY catalog/ catalog/
COPY tests/ tests/
COPY configs/ configs/

RUN pip install --upgrade pip \
    && pip install -e ".[dev]"

RUN groupadd --gid 1000 ihl \
    && useradd --uid 1000 --gid ihl --create-home ihl \
    && chown -R ihl:ihl /app

USER ihl

EXPOSE 8501

CMD ["streamlit", "run", "apps/search/app.py", \
     "--server.address=0.0.0.0", \
     "--server.port=8501"]

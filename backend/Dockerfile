FROM ghcr.io/astral-sh/uv:python3.14-bookworm as base

ENV PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PYTHONUNBUFFERED=1

WORKDIR /app

FROM base AS builder

ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN python -m venv /venv
ENV VIRTUAL_ENV=/venv

COPY . .
RUN uv sync --active

FROM base AS final

COPY --from=builder /venv /venv
COPY . /app

ENV PYTHONPATH=/venv \
    PATH=/venv/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN useradd -ms /bin/bash backend
USER backend

ENTRYPOINT ["/app/docker-entrypoint.sh"]


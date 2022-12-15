FROM python:3.11 as base

ENV PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PYTHONUNBUFFERED=1

WORKDIR /app

FROM base as builder

ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN pip install -U setuptools pip
RUN pip install -U poetry
RUN python -m venv /venv

ENV VIRTUAL_ENV=/venv

COPY pyproject.toml poetry.lock ./
RUN poetry install

COPY . .
RUN poetry build && /venv/bin/pip install dist/*.whl

FROM base as final

COPY --from=builder /venv /venv
COPY . /app

ENV PYTHONPATH=/venv \
    PATH=/venv/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN useradd -ms /bin/bash backend
USER backend

ENTRYPOINT ["/app/docker-entrypoint.sh"]


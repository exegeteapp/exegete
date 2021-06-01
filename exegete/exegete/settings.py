from pathlib import Path
import os


def get_env(k, warn=True):
    if k not in os.environ:
        if warn:
            print("warning: environment variable {} not set, returning None".format(k))
        return None
    return os.environ[k]


import random
import string

random_secret_key = "".join(
    random.choices(string.ascii_uppercase + string.digits, k=50)
)


def get_secret_key():
    key = get_env("SECRET_KEY")
    if key is None:
        print(
            "warning: no SECRET_KEY set, using random key. sessions will be invalidated after restart."
        )
        key = random_secret_key
    return key


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = get_secret_key()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = get_env("DEBUG") == "1"

ALLOWED_HOSTS = ["exegete.app"]
if get_env("APP_DOMAIN", False):
    ALLOWED_HOSTS.append(get_env("APP_DOMAIN"))
if DEBUG:
    ALLOWED_HOSTS += ["localhost"]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "exegete.textapi",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "exegete.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "exegete.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        # 'OPTIONS': {
        #     'options': '-c search_path={}'.format(get_env('DB_SCHEMA'))
        # },
        "NAME": get_env("DB_NAME"),
        "USER": get_env("DB_USERNAME"),
        "PASSWORD": get_env("DB_PASSWORD"),
        "HOST": get_env("DB_HOST"),
        "PORT": get_env("DB_PORT"),
    }
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": get_env("REDIS_LOCATION"),
        "OPTIONS": {"CONNECTION_POOL_KWARGS": {"max_connections": 100}},
    }
}

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = "/django-static/"
STATIC_ROOT = "./django-static/"

if not DEBUG:
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 60
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # caddy or nginx sitting in front of the app
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
